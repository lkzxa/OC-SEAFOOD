const request = require('supertest');
const app = require('../app');
const prisma = require('../config/prisma');
const env = require('../config/env');
const { signToken } = require('../utils/jwt');
const { sendTelegramMessage, sendZaloMessage } = require('../workers/notificationWorker');

jest.mock('../config/prisma', () => {
  return {
    systemSetting: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    $transaction: jest.fn((promises) => Promise.all(promises)),
  };
});

jest.mock('../workers/notificationWorker', () => {
  return {
    sendTelegramMessage: jest.fn().mockResolvedValue({ ok: true }),
    sendZaloMessage: jest.fn().mockResolvedValue({ ok: true }),
    createMailTransporter: jest.fn(),
  };
});

describe('System Settings API - /settings', () => {
  let adminToken;
  let customerToken;
  let originalEnv;

  beforeAll(() => {
    adminToken = signToken({ id: 1, email: 'admin@example.com', role: 'ADMIN' });
    customerToken = signToken({ id: 5, email: 'customer@example.com', role: 'CUSTOMER' });

    originalEnv = { ...process.env };
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
    delete process.env.ZALO_OA_ACCESS_TOKEN;
    delete process.env.ZALO_USER_ID;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Security & Access Control', () => {
    it('should reject unauthenticated request with 401', async () => {
      await request(app).get('/settings').expect(401);
      await request(app).put('/settings').send({}).expect(401);
      await request(app).post('/settings/test-telegram').expect(401);
      await request(app).post('/settings/test-zalo').expect(401);
    });

    it('should reject CUSTOMER role request with 403', async () => {
      await request(app)
        .get('/settings')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      await request(app)
        .put('/settings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({})
        .expect(403);
    });
  });

  describe('GET /settings/public', () => {
    it('should successfully fetch public settings without authentication', async () => {
      prisma.systemSetting.findMany.mockResolvedValue([
        { key: 'HOMEPAGE_ANNOUNCEMENT_ENABLED', value: 'true' },
        { key: 'HOMEPAGE_ANNOUNCEMENT_CONTENT', value: 'Voucher 30%' },
        { key: 'CONTACT_HOTLINE', value: '0901234567' },
      ]);

      const res = await request(app)
        .get('/settings/public')
        .expect(200);

      expect(res.body).toEqual({
        HOMEPAGE_ANNOUNCEMENT_ENABLED: true,
        HOMEPAGE_ANNOUNCEMENT_CONTENT: 'Voucher 30%',
        CONTACT_HOTLINE: '0901234567',
        CONTACT_ZALO: 'https://zalo.me/0908464818',
        CONTACT_FACEBOOK: '',
        MARQUEE_ENABLED: true,
        MARQUEE_CONTENT: '',
      });
      expect(prisma.systemSetting.findMany).toHaveBeenCalled();
    });

    it('returns the official contact defaults when the database has no contact settings', async () => {
      prisma.systemSetting.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/settings/public')
        .expect(200);

      expect(res.body.CONTACT_HOTLINE).toBe('0908 464 818');
      expect(res.body.CONTACT_ZALO).toBe('https://zalo.me/0908464818');
    });
  });

  describe('GET /settings', () => {
    it('should successfully fetch current settings as ADMIN', async () => {
      prisma.systemSetting.findMany.mockResolvedValue([
        { key: 'TELEGRAM_BOT_TOKEN', value: 'token-xyz' },
        { key: 'TELEGRAM_CHAT_ID', value: 'chat-123' },
        { key: 'HOMEPAGE_ANNOUNCEMENT_ENABLED', value: 'true' },
        { key: 'HOMEPAGE_ANNOUNCEMENT_CONTENT', value: 'Voucher 30%' },
      ]);

      const res = await request(app)
        .get('/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toEqual({
        TELEGRAM_BOT_TOKEN: '',
        TELEGRAM_BOT_TOKEN_CONFIGURED: true,
        TELEGRAM_CHAT_ID: 'chat-123',
        RECRUITMENT_TELEGRAM_BOT_TOKEN: '',
        RECRUITMENT_TELEGRAM_BOT_TOKEN_CONFIGURED: false,
        RECRUITMENT_TELEGRAM_CHAT_ID: '',
        ZALO_OA_ACCESS_TOKEN: '',
        ZALO_OA_ACCESS_TOKEN_CONFIGURED: false,
        ZALO_USER_ID: '',
        SMTP_HOST: '',
        SMTP_PORT: '',
        SMTP_USER: '',
        SMTP_PASS: '',
        SMTP_PASS_CONFIGURED: false,
        SMTP_SECURE: false,
        EMAIL_FROM: '',
        HOMEPAGE_ANNOUNCEMENT_ENABLED: true,
        HOMEPAGE_ANNOUNCEMENT_CONTENT: 'Voucher 30%',
        CONTACT_HOTLINE: '0908 464 818',
        CONTACT_ZALO: 'https://zalo.me/0908464818',
        CONTACT_FACEBOOK: '',
        MARQUEE_ENABLED: true,
        MARQUEE_CONTENT: '',
      });
      expect(prisma.systemSetting.findMany).toHaveBeenCalled();
      expect(JSON.stringify(res.body)).not.toContain('token-xyz');
    });

    it('reports recruitment Telegram fallback from validated environment config', async () => {
      const originalToken = env.RECRUITMENT_TELEGRAM_BOT_TOKEN;
      const originalChatId = env.RECRUITMENT_TELEGRAM_CHAT_ID;
      env.RECRUITMENT_TELEGRAM_BOT_TOKEN = 'environment-recruitment-token';
      env.RECRUITMENT_TELEGRAM_CHAT_ID = 'environment-recruitment-chat';
      prisma.systemSetting.findMany.mockResolvedValue([]);

      try {
        const res = await request(app)
          .get('/settings')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(res.body.RECRUITMENT_TELEGRAM_BOT_TOKEN).toBe('');
        expect(res.body.RECRUITMENT_TELEGRAM_BOT_TOKEN_CONFIGURED).toBe(true);
        expect(res.body.RECRUITMENT_TELEGRAM_CHAT_ID).toBe('environment-recruitment-chat');
        expect(JSON.stringify(res.body)).not.toContain('environment-recruitment-token');
      } finally {
        env.RECRUITMENT_TELEGRAM_BOT_TOKEN = originalToken;
        env.RECRUITMENT_TELEGRAM_CHAT_ID = originalChatId;
      }
    });
  });

  describe('PUT /settings', () => {
    it('should successfully save settings as ADMIN', async () => {
      const payload = {
        TELEGRAM_BOT_TOKEN: 'new-token',
        TELEGRAM_CHAT_ID: 'new-chat',
        RECRUITMENT_TELEGRAM_BOT_TOKEN: 'rec-token',
        RECRUITMENT_TELEGRAM_CHAT_ID: 'rec-chat',
        ZALO_OA_ACCESS_TOKEN: 'zalo-token',
        ZALO_USER_ID: 'zalo-user',
        HOMEPAGE_ANNOUNCEMENT_ENABLED: true,
        HOMEPAGE_ANNOUNCEMENT_CONTENT: 'New Voucher Promo',
        CONTACT_HOTLINE: '0901234567',
        CONTACT_ZALO: 'https://zalo.me/12345',
        CONTACT_FACEBOOK: 'https://fb.com/page',
      };

      await request(app)
        .put('/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload)
        .expect(200);

      expect(prisma.systemSetting.upsert).toHaveBeenCalledTimes(18);
      expect(prisma.systemSetting.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { key: 'TELEGRAM_BOT_TOKEN' },
          create: { key: 'TELEGRAM_BOT_TOKEN', value: 'new-token' },
          update: { value: 'new-token' },
        })
      );
      expect(prisma.systemSetting.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { key: 'RECRUITMENT_TELEGRAM_BOT_TOKEN' },
          create: { key: 'RECRUITMENT_TELEGRAM_BOT_TOKEN', value: 'rec-token' },
          update: { value: 'rec-token' },
        })
      );
      expect(prisma.systemSetting.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { key: 'HOMEPAGE_ANNOUNCEMENT_ENABLED' },
          create: { key: 'HOMEPAGE_ANNOUNCEMENT_ENABLED', value: 'true' },
          update: { value: 'true' },
        })
      );
      expect(prisma.systemSetting.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { key: 'CONTACT_HOTLINE' },
          create: { key: 'CONTACT_HOTLINE', value: '0901234567' },
          update: { value: '0901234567' },
        })
      );
    });

    it('preserves saved secrets when the browser submits blank fields', async () => {
      await request(app)
        .put('/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          TELEGRAM_BOT_TOKEN: '',
          RECRUITMENT_TELEGRAM_BOT_TOKEN: '',
          ZALO_OA_ACCESS_TOKEN: '',
          SMTP_PASS: '',
        })
        .expect(200);

      for (const secretKey of ['TELEGRAM_BOT_TOKEN', 'RECRUITMENT_TELEGRAM_BOT_TOKEN', 'ZALO_OA_ACCESS_TOKEN', 'SMTP_PASS']) {
        expect(prisma.systemSetting.upsert).not.toHaveBeenCalledWith(expect.objectContaining({ where: { key: secretKey } }));
      }
    });
  });

  describe('POST /settings/test-telegram', () => {
    it('should successfully trigger test telegram message', async () => {
      prisma.systemSetting.findMany.mockResolvedValue([
        { key: 'TELEGRAM_BOT_TOKEN', value: 'token-xyz' },
        { key: 'TELEGRAM_CHAT_ID', value: 'chat-123' },
      ]);

      await request(app)
        .post('/settings/test-telegram')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(sendTelegramMessage).toHaveBeenCalledWith(
        'token-xyz',
        'chat-123',
        expect.stringContaining('kiểm tra kết nối')
      );
    });

    it('should return 400 if telegram configuration is missing', async () => {
      prisma.systemSetting.findMany.mockResolvedValue([]); // Empty settings

      const res = await request(app)
        .post('/settings/test-telegram')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(res.body.error.message).toContain('Telegram configuration is missing');
      expect(sendTelegramMessage).not.toHaveBeenCalled();
    });
  });

  describe('POST /settings/test-recruitment-telegram', () => {
    it('should successfully trigger test recruitment telegram message', async () => {
      prisma.systemSetting.findMany.mockResolvedValue([
        { key: 'RECRUITMENT_TELEGRAM_BOT_TOKEN', value: 'rec-token-xyz' },
        { key: 'RECRUITMENT_TELEGRAM_CHAT_ID', value: 'rec-chat-123' },
      ]);

      await request(app)
        .post('/settings/test-recruitment-telegram')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(sendTelegramMessage).toHaveBeenCalledWith(
        'rec-token-xyz',
        'rec-chat-123',
        expect.stringContaining('kiểm tra kết nối tuyển dụng')
      );
    });

    it('should return 400 if recruitment telegram configuration is missing', async () => {
      prisma.systemSetting.findMany.mockResolvedValue([]); // Empty settings

      const res = await request(app)
        .post('/settings/test-recruitment-telegram')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(res.body.error.message).toContain('Recruitment Telegram configuration is missing');
      expect(sendTelegramMessage).not.toHaveBeenCalled();
    });
  });

  describe('POST /settings/test-zalo', () => {
    it('should successfully trigger test zalo message', async () => {
      prisma.systemSetting.findMany.mockResolvedValue([
        { key: 'ZALO_OA_ACCESS_TOKEN', value: 'zalo-token-abc' },
        { key: 'ZALO_USER_ID', value: 'zalo-user-123' },
      ]);

      await request(app)
        .post('/settings/test-zalo')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(sendZaloMessage).toHaveBeenCalledWith(
        'zalo-token-abc',
        'zalo-user-123',
        expect.stringContaining('kiểm tra kết nối')
      );
    });

    it('should return 400 if zalo configuration is missing', async () => {
      prisma.systemSetting.findMany.mockResolvedValue([]); // Empty settings

      const res = await request(app)
        .post('/settings/test-zalo')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(res.body.error.message).toContain('Zalo configuration is missing');
      expect(sendZaloMessage).not.toHaveBeenCalled();
    });
  });
});
