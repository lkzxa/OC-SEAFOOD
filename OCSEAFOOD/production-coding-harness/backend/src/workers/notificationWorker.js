const nodemailer = require('nodemailer');
const https = require('https');
const prisma = require('../config/prisma');
const env = require('../config/env');

let intervalId = null;
let isProcessing = false;

/**
 * Creates nodemailer transport. Falls back to console log mock if credentials are not present.
 */
function createMailTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.warn('⚠️ SMTP credentials not fully configured. Email notifications will be printed to console.');
    return {
      sendMail: async (mailOptions) => {
        console.log(`[MOCK EMAIL SENT]
From: ${mailOptions.from}
To: ${mailOptions.to}
Subject: ${mailOptions.subject}
Content:
${mailOptions.text || mailOptions.html}
`);
        return { messageId: 'mock-email-id-' + Date.now() };
      }
    };
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });
}

/**
 * Sends a message via Telegram Bot API using Node's standard https module.
 * Falls back to console log mock if bot token or chat ID is missing.
 */
function sendTelegramMessage(token, chatId, text) {
  if (!token || !chatId) {
    console.warn('⚠️ Telegram bot credentials not fully configured. Telegram notifications will be printed to console.');
    console.log(`[MOCK TELEGRAM SENT] ChatID: ${chatId}, Message: ${text}`);
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
    console.warn('⚠️ Zalo credentials not fully configured. Zalo notifications will be printed to console.');
    console.log(`[MOCK ZALO SENT] UserID: ${userId}, Message: ${text}`);
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
  const zaloAccessToken = settingsMap['ZALO_OA_ACCESS_TOKEN'] || env.ZALO_OA_ACCESS_TOKEN;
  const zaloUserId = settingsMap['ZALO_USER_ID'] || env.ZALO_USER_ID;

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
    console.warn('⚠️ Notification worker: Database connection failed. Retrying on next tick...');
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
          from: env.EMAIL_FROM,
          to: env.EMAIL_TO_ADMIN,
          subject: `[OCSEAFOOD] New Order Request: ${payload.code}`,
          html: `
            <h3>New Virtual Order Placed</h3>
            <p><strong>Order ID:</strong> ${payload.orderId}</p>
            <p><strong>Code:</strong> ${payload.code}</p>
            <p><strong>Customer Name:</strong> ${payload.fullName}</p>
            <p><strong>Customer Email:</strong> ${payload.email}</p>
            <p><strong>Estimated Total:</strong> ${payload.totalFinal} VND</p>
            <p>Please log in to the admin dashboard to process this order and contact the customer.</p>
          `
        };

        const transporter = createMailTransporter();
        await transporter.sendMail(mailOptions);
      } else if (record.type === 'TELEGRAM') {
        const payload = record.payload;
        const isRecruitment = payload.isRecruitment === true;
        const targetToken = (isRecruitment && settingsMap['RECRUITMENT_TELEGRAM_BOT_TOKEN'])
          ? settingsMap['RECRUITMENT_TELEGRAM_BOT_TOKEN']
          : telegramToken;
        const targetChatId = (isRecruitment && settingsMap['RECRUITMENT_TELEGRAM_CHAT_ID'])
          ? settingsMap['RECRUITMENT_TELEGRAM_CHAT_ID']
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
async function runTick() {
  if (isProcessing) return;
  isProcessing = true;
  try {
    await processOutbox();
  } catch (err) {
    console.error('❌ Error in notification worker outbox processing tick:', err);
  } finally {
    isProcessing = false;
  }
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
    runTick();
    intervalId = setInterval(runTick, intervalMs);
    console.log(`🚀 Notification outbox worker started. Polling interval: ${intervalMs}ms`);
  }
}

/**
 * Stop the background poller daemon.
 */
function stopNotificationWorker() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('⏹️ Notification outbox worker stopped.');
  }
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
