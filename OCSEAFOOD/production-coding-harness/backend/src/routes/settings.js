const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { sendTelegramMessage, sendZaloMessage, createMailTransporter } = require('../workers/notificationWorker');
const env = require('../config/env');

// Helper to get all settings as key-value
async function getSettingsMap() {
  const list = await prisma.systemSetting.findMany();
  const map = {};
  for (const item of list) {
    map[item.key] = item.value;
  }
  return map;
}

// GET /settings/public - Fetch public settings (Public)
router.get('/public', async (req, res, next) => {
  try {
    const list = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: [
            'HOMEPAGE_ANNOUNCEMENT_ENABLED',
            'HOMEPAGE_ANNOUNCEMENT_CONTENT',
            'CONTACT_HOTLINE',
            'CONTACT_ZALO',
            'CONTACT_FACEBOOK'
          ]
        }
      }
    }).catch((err) => {
      console.warn('⚠️ Database query for public settings failed. Using fallback values:', err.message);
      return [];
    });
    const map = {};
    for (const item of list) {
      map[item.key] = item.value;
    }
    return res.status(200).json({
      HOMEPAGE_ANNOUNCEMENT_ENABLED: map['HOMEPAGE_ANNOUNCEMENT_ENABLED'] === 'true',
      HOMEPAGE_ANNOUNCEMENT_CONTENT: map['HOMEPAGE_ANNOUNCEMENT_CONTENT'] || '',
      CONTACT_HOTLINE: map['CONTACT_HOTLINE'] || '',
      CONTACT_ZALO: map['CONTACT_ZALO'] || '',
      CONTACT_FACEBOOK: map['CONTACT_FACEBOOK'] || '',
    });
  } catch (err) {
    next(err);
  }
});

// GET /settings - Fetch current settings (Admin only)
router.get('/', auth, authorize('ADMIN'), async (req, res, next) => {
  try {
    const settings = await getSettingsMap();
    return res.status(200).json({
      TELEGRAM_BOT_TOKEN: settings['TELEGRAM_BOT_TOKEN'] || '',
      TELEGRAM_CHAT_ID: settings['TELEGRAM_CHAT_ID'] || '',
      RECRUITMENT_TELEGRAM_BOT_TOKEN: settings['RECRUITMENT_TELEGRAM_BOT_TOKEN'] || '',
      RECRUITMENT_TELEGRAM_CHAT_ID: settings['RECRUITMENT_TELEGRAM_CHAT_ID'] || '',
      ZALO_OA_ACCESS_TOKEN: settings['ZALO_OA_ACCESS_TOKEN'] || '',
      ZALO_USER_ID: settings['ZALO_USER_ID'] || '',
      SMTP_HOST: settings['SMTP_HOST'] || '',
      SMTP_PORT: settings['SMTP_PORT'] || '',
      SMTP_USER: settings['SMTP_USER'] || '',
      SMTP_PASS: settings['SMTP_PASS'] || '',
      SMTP_SECURE: settings['SMTP_SECURE'] === 'true',
      EMAIL_FROM: settings['EMAIL_FROM'] || '',
      HOMEPAGE_ANNOUNCEMENT_ENABLED: settings['HOMEPAGE_ANNOUNCEMENT_ENABLED'] === 'true',
      HOMEPAGE_ANNOUNCEMENT_CONTENT: settings['HOMEPAGE_ANNOUNCEMENT_CONTENT'] || '',
      CONTACT_HOTLINE: settings['CONTACT_HOTLINE'] || '',
      CONTACT_ZALO: settings['CONTACT_ZALO'] || '',
      CONTACT_FACEBOOK: settings['CONTACT_FACEBOOK'] || '',
    });
  } catch (err) {
    next(err);
  }
});

// PUT /settings - Save settings (Admin only)
router.put('/', auth, authorize('ADMIN'), async (req, res, next) => {
  try {
    const {
      TELEGRAM_BOT_TOKEN,
      TELEGRAM_CHAT_ID,
      RECRUITMENT_TELEGRAM_BOT_TOKEN,
      RECRUITMENT_TELEGRAM_CHAT_ID,
      ZALO_OA_ACCESS_TOKEN,
      ZALO_USER_ID,
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      SMTP_SECURE,
      EMAIL_FROM,
      HOMEPAGE_ANNOUNCEMENT_ENABLED,
      HOMEPAGE_ANNOUNCEMENT_CONTENT,
      CONTACT_HOTLINE,
      CONTACT_ZALO,
      CONTACT_FACEBOOK
    } = req.body;

    const keysToSave = {
      TELEGRAM_BOT_TOKEN: TELEGRAM_BOT_TOKEN || '',
      TELEGRAM_CHAT_ID: TELEGRAM_CHAT_ID || '',
      RECRUITMENT_TELEGRAM_BOT_TOKEN: RECRUITMENT_TELEGRAM_BOT_TOKEN || '',
      RECRUITMENT_TELEGRAM_CHAT_ID: RECRUITMENT_TELEGRAM_CHAT_ID || '',
      ZALO_OA_ACCESS_TOKEN: ZALO_OA_ACCESS_TOKEN || '',
      ZALO_USER_ID: ZALO_USER_ID || '',
      SMTP_HOST: SMTP_HOST || '',
      SMTP_PORT: SMTP_PORT || '',
      SMTP_USER: SMTP_USER || '',
      SMTP_PASS: SMTP_PASS || '',
      SMTP_SECURE: SMTP_SECURE ? 'true' : 'false',
      EMAIL_FROM: EMAIL_FROM || '',
      HOMEPAGE_ANNOUNCEMENT_ENABLED: HOMEPAGE_ANNOUNCEMENT_ENABLED ? 'true' : 'false',
      HOMEPAGE_ANNOUNCEMENT_CONTENT: HOMEPAGE_ANNOUNCEMENT_CONTENT || '',
      CONTACT_HOTLINE: CONTACT_HOTLINE || '',
      CONTACT_ZALO: CONTACT_ZALO || '',
      CONTACT_FACEBOOK: CONTACT_FACEBOOK || '',
    };

    // Perform upsert inside transaction
    await prisma.$transaction(
      Object.entries(keysToSave).map(([key, value]) =>
        prisma.systemSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value }
        })
      )
    );

    return res.status(200).json({ status: 'success', message: 'Settings updated successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /settings/test-telegram - Send test message (Admin only)
router.post('/test-telegram', auth, authorize('ADMIN'), async (req, res, next) => {
  try {
    const settings = await getSettingsMap();
    const { token: bodyToken, chatId: bodyChatId } = req.body || {};
    const token = bodyToken || settings['TELEGRAM_BOT_TOKEN'] || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = bodyChatId || settings['TELEGRAM_CHAT_ID'] || process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return res.status(400).json({ error: { message: 'Telegram configuration is missing', status: 400 } });
    }

    await sendTelegramMessage(token, chatId, '🔔 Đây là tin nhắn kiểm tra kết nối từ trang quản trị OCSEAFOOD!');
    return res.status(200).json({ status: 'success', message: 'Test message sent successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /settings/test-recruitment-telegram - Send test message (Admin only)
router.post('/test-recruitment-telegram', auth, authorize('ADMIN'), async (req, res, next) => {
  try {
    const settings = await getSettingsMap();
    const { token: bodyToken, chatId: bodyChatId } = req.body || {};
    const token = bodyToken || settings['RECRUITMENT_TELEGRAM_BOT_TOKEN'] || process.env.RECRUITMENT_TELEGRAM_BOT_TOKEN;
    const chatId = bodyChatId || settings['RECRUITMENT_TELEGRAM_CHAT_ID'] || process.env.RECRUITMENT_TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return res.status(400).json({ error: { message: 'Recruitment Telegram configuration is missing', status: 400 } });
    }

    await sendTelegramMessage(token, chatId, '🔔 Đây là tin nhắn kiểm tra kết nối tuyển dụng từ trang quản trị OCSEAFOOD!');
    return res.status(200).json({ status: 'success', message: 'Test message sent successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /settings/test-zalo - Send test message (Admin only)
router.post('/test-zalo', auth, authorize('ADMIN'), async (req, res, next) => {
  try {
    const settings = await getSettingsMap();
    const { accessToken: bodyAccessToken, userId: bodyUserId } = req.body || {};
    const accessToken = bodyAccessToken || settings['ZALO_OA_ACCESS_TOKEN'] || process.env.ZALO_OA_ACCESS_TOKEN;
    const userId = bodyUserId || settings['ZALO_USER_ID'] || process.env.ZALO_USER_ID;

    if (!accessToken || !userId) {
      return res.status(400).json({ error: { message: 'Zalo configuration is missing', status: 400 } });
    }

    await sendZaloMessage(accessToken, userId, '🔔 Đây là tin nhắn kiểm tra kết nối từ trang quản trị OCSEAFOOD!');
    return res.status(200).json({ status: 'success', message: 'Test message sent successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /settings/test-email - Send test email via SMTP (Admin only)
router.post('/test-email', auth, authorize('ADMIN'), async (req, res, next) => {
  try {
    const settings = await getSettingsMap();
    const smtpSettings = {
      host: settings['SMTP_HOST'] || env.SMTP_HOST,
      port: parseInt(settings['SMTP_PORT'], 10) || env.SMTP_PORT,
      user: settings['SMTP_USER'] || env.SMTP_USER,
      pass: settings['SMTP_PASS'] || env.SMTP_PASS,
      secure: settings['SMTP_SECURE'] ? settings['SMTP_SECURE'] === 'true' : env.SMTP_SECURE,
    };
    const emailFrom = settings['EMAIL_FROM'] || env.EMAIL_FROM;

    if (!smtpSettings.host || !smtpSettings.user || !smtpSettings.pass) {
      return res.status(400).json({ error: { message: 'SMTP configuration is missing', status: 400 } });
    }

    const to = req.user.email || env.EMAIL_TO_ADMIN;
    const transporter = createMailTransporter(smtpSettings);
    await transporter.sendMail({
      from: emailFrom,
      to,
      subject: '[OCSEAFOOD] Email kiểm tra kết nối SMTP',
      html: '<p>🔔 Đây là email kiểm tra kết nối từ trang quản trị OCSEAFOOD!</p>',
    });

    return res.status(200).json({ status: 'success', message: 'Test email sent successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
