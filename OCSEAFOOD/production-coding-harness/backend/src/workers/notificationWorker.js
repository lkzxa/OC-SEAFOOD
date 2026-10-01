const nodemailer = require('nodemailer');
const https = require('https');
const net = require('net');
const dns = require('dns');
const prisma = require('../config/prisma');
const env = require('../config/env');
const logger = require('../utils/logger');

let intervalId = null;
let isProcessing = false;
let activeTickPromise = null;

/**
 * Resolves a hostname to its IPv4 address. nodemailer picks IPv4 vs IPv6 based on
 * which address families the local machine's network interfaces report. Some
 * container networks report IPv6 without providing an outbound IPv6 route.
 * Resolving to IPv4 ourselves and
 * passing the literal IP bypasses that broken detection (nodemailer skips its own
 * DNS logic whenever `host` is already an IP).
 */
async function resolveIPv4(host) {
  if (net.isIP(host)) return host;
  try {
    const addresses = await dns.promises.resolve4(host);
    if (addresses && addresses.length > 0) return addresses[0];
  } catch (_err) {
    // Fall through to the original hostname if IPv4 resolution fails.
  }
  return host;
}

/**
 * Creates nodemailer transport from a resolved SMTP settings object
 * ({ host, port, user, pass, secure }). Falls back to console log mock if credentials are not present.
 */
async function createMailTransporter(smtpSettings) {
  const { host, port, user, pass, secure } = smtpSettings || {};

  if (!host || !user || !pass) {
    logger.warn('smtp_not_configured');
    return {
      sendMail: async (mailOptions) => {
        logger.info('email_delivery_skipped', { reason: 'smtp_not_configured' });
        return { messageId: 'mock-email-id-' + Date.now() };
      }
    };
  }

  const resolvedHost = await resolveIPv4(host);

  return nodemailer.createTransport({
    host: resolvedHost,
    port,
    secure,
    auth: {
      user,
      pass
    },
    // Preserve TLS SNI/certificate validation against the real hostname even
    // though we connect using its resolved IPv4 address above.
    tls: {
      servername: host
    },
    // Fail fast instead of hanging for minutes (nodemailer defaults are very long)
    // on a wrong host/port/secure combination.
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });
}

/**
 * Sends a message via Telegram Bot API using Node's standard https module.
 * Falls back to console log mock if bot token or chat ID is missing.
 */
function sendTelegramMessage(token, chatId, text) {
  if (!token || !chatId) {
    logger.warn('telegram_not_configured');
    return Promise.resolve({ ok: true });
  }

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve(body);
          }
        } else {
          reject(new Error(`Telegram API responded with status ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

/**
 * Sends a message via Zalo OA Message API using Node's standard https module.
 * Falls back to console log mock if accessToken or userId is missing.
 */
function sendZaloMessage(accessToken, userId, text) {
  if (!accessToken || !userId) {
    logger.warn('zalo_not_configured');
    return Promise.resolve({ ok: true });
  }

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      recipient: {
        user_id: userId
      },
      message: {
        text: text
      }
    });

    const options = {
      hostname: 'openapi.zalo.me',
      port: 443,
      path: '/v3.0/oa/message/cs',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': accessToken,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve(body);
          }
        } else {
          reject(new Error(`Zalo API responded with status ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

/**
 * Main function to poll and process pending notification outbox records.
 */
async function processOutbox() {
  const now = new Date();
  const maxRetries = env.MAX_NOTIFICATION_RETRIES;

  // Retrieve current settings from database
  const dbSettings = await prisma.systemSetting.findMany().catch(() => []);
  const settingsMap = {};
  for (const s of dbSettings) {
    settingsMap[s.key] = s.value;
  }

  const telegramToken = settingsMap['TELEGRAM_BOT_TOKEN'] || env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = settingsMap['TELEGRAM_CHAT_ID'] || env.TELEGRAM_CHAT_ID;
  const recruitmentTelegramToken =
    settingsMap['RECRUITMENT_TELEGRAM_BOT_TOKEN'] || env.RECRUITMENT_TELEGRAM_BOT_TOKEN;
  const recruitmentTelegramChatId =
    settingsMap['RECRUITMENT_TELEGRAM_CHAT_ID'] || env.RECRUITMENT_TELEGRAM_CHAT_ID;
  const zaloAccessToken = settingsMap['ZALO_OA_ACCESS_TOKEN'] || env.ZALO_OA_ACCESS_TOKEN;
  const zaloUserId = settingsMap['ZALO_USER_ID'] || env.ZALO_USER_ID;
  const smtpSettings = {
    host: settingsMap['SMTP_HOST'] || env.SMTP_HOST,
    port: parseInt(settingsMap['SMTP_PORT'], 10) || env.SMTP_PORT,
    user: settingsMap['SMTP_USER'] || env.SMTP_USER,
    pass: settingsMap['SMTP_PASS'] || env.SMTP_PASS,
    secure: settingsMap['SMTP_SECURE'] ? settingsMap['SMTP_SECURE'] === 'true' : env.SMTP_SECURE,
  };
  const emailFrom = settingsMap['EMAIL_FROM'] || env.EMAIL_FROM;

  // Retrieve pending outbox logs.
  // Note: Only query records with PENDING status. FAILED notifications have reached maxRetries.
  let pendingRecords = [];
  try {
    pendingRecords = await prisma.notificationOutbox.findMany({
      where: {
        status: 'PENDING'
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  } catch (err) {
    logger.error('notification_worker_database_query_failed', { error: err });
    return;
  }

  for (const record of pendingRecords) {
    // Implement exponential backoff if this record has previously failed
    if (record.retries > 0) {
      const backoffMs = Math.pow(2, record.retries) * 1000;
      const nextAllowedTime = new Date(record.updatedAt.getTime() + backoffMs);
      if (now < nextAllowedTime) {
        // Skip this record for this tick
        continue;
      }
    }

    try {
      if (record.type === 'EMAIL') {
        const payload = record.payload;
        const mailOptions = {
          from: payload.from || emailFrom,
          to: payload.to || env.EMAIL_TO_ADMIN,
          subject: payload.subject || `[OCSEAFOOD] New Order Request: ${payload.code}`,
          html: payload.html || `
            <h3>New Virtual Order Placed</h3>
            <p><strong>Order ID:</strong> ${payload.orderId}</p>
            <p><strong>Code:</strong> ${payload.code}</p>
            <p><strong>Customer Name:</strong> ${payload.fullName}</p>
            <p><strong>Account Status:</strong> ${payload.hasAccount ? 'Registered Customer' : 'Guest (No Account)'}</p>
            <p><strong>Customer Email:</strong> ${payload.email}</p>
            <p><strong>Estimated Total:</strong> ${payload.totalFinal} VND</p>
            <p>Please log in to the admin dashboard to process this order and contact the customer.</p>
          `
        };

        const transporter = await createMailTransporter(smtpSettings);
        await transporter.sendMail(mailOptions);
      } else if (record.type === 'TELEGRAM') {
        const payload = record.payload;
        const isRecruitment = payload.isRecruitment === true;
        const targetToken = isRecruitment
          ? recruitmentTelegramToken || telegramToken
          : telegramToken;
        const targetChatId = isRecruitment
          ? recruitmentTelegramChatId || telegramChatId
          : telegramChatId;
        await sendTelegramMessage(targetToken, targetChatId, payload.message);
      } else if (record.type === 'ZALO') {
        const payload = record.payload;
        await sendZaloMessage(zaloAccessToken, zaloUserId, payload.message);
      } else {
        throw new Error(`Unsupported notification type: ${record.type}`);
      }

      // Record successful dispatch inside transaction block
      await prisma.$transaction(async (tx) => {
        await tx.notificationOutbox.update({
          where: { id: record.id },
          data: {
            status: 'SENT',
            error: null
          }
        });
      });
    } catch (err) {
      const nextRetries = record.retries + 1;
      const nextStatus = nextRetries >= maxRetries ? 'FAILED' : 'PENDING';

      // Update failure state inside transaction block
      await prisma.$transaction(async (tx) => {
        await tx.notificationOutbox.update({
          where: { id: record.id },
          data: {
            status: nextStatus,
            error: err.message || String(err),
            retries: nextRetries
          }
        });
      });
    }
  }
}

/**
 * Worker execution wrapper enforcing non-concurrency inside ticks.
 */
function runTick() {
  if (isProcessing) return activeTickPromise;
  isProcessing = true;
  activeTickPromise = processOutbox()
    .catch((err) => logger.error('notification_worker_tick_failed', { error: err }))
    .finally(() => {
      isProcessing = false;
      activeTickPromise = null;
    });
  return activeTickPromise;
}

/**
 * Start the background poller daemon.
 */
function startNotificationWorker() {
  if (process.env.NODE_ENV === 'test') {
    // Explicitly do not boot daemon inside test environments
    return;
  }
  const intervalMs = env.NOTIFICATION_WORKER_INTERVAL_MS;
  if (!intervalId) {
    // Run an initial tick synchronously, then start interval
    void runTick();
    intervalId = setInterval(runTick, intervalMs);
    logger.info('notification_worker_started', { intervalMs });
  }
}

/**
 * Stop the background poller daemon.
 */
async function stopNotificationWorker() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (activeTickPromise) await activeTickPromise;
  logger.info('notification_worker_stopped');
}

module.exports = {
  processOutbox,
  runTick,
  startNotificationWorker,
  stopNotificationWorker,
  sendTelegramMessage,
  createMailTransporter,
  sendZaloMessage
};
