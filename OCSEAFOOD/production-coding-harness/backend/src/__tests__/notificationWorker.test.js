const nodemailer = require('nodemailer');
const https = require('https');
const prisma = require('../config/prisma');
const env = require('../config/env');
const { processOutbox } = require('../workers/notificationWorker');

jest.mock('../config/prisma', () => ({
  notificationOutbox: {
    findMany: jest.fn(),
    update: jest.fn()
  },
  systemSetting: {
    findMany: jest.fn().mockResolvedValue([])
  },
  $transaction: jest.fn()
}));

jest.mock('nodemailer');
jest.mock('https');

describe('Notification Outbox Worker', () => {
  let mockSendMail;
  let errorListeners;
  let mockResponseStatusCode;
  let mockResponseBody;
  let shouldFailRequest;

  beforeAll(() => {
    // Set mock env vars
    env.SMTP_HOST = 'smtp.test.com';
    env.SMTP_USER = 'user';
    env.SMTP_PASS = 'pass';
    env.SMTP_PORT = 587;
    env.SMTP_SECURE = false;
    env.EMAIL_FROM = 'no-reply@test.com';
    env.EMAIL_TO_ADMIN = 'admin@test.com';
    env.TELEGRAM_BOT_TOKEN = 'bot-token-123';
    env.TELEGRAM_CHAT_ID = 'chat-id-456';
    env.ZALO_OA_ACCESS_TOKEN = 'zalo-oa-token-123';
    env.ZALO_USER_ID = 'zalo-user-456';
    env.MAX_NOTIFICATION_RETRIES = 5;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async (callback) => callback(prisma));

    // Nodemailer mock setup
    mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-email-123' });
    nodemailer.createTransport.mockReturnValue({
      sendMail: mockSendMail
    });

    // HTTPS request mock setup for Telegram
    errorListeners = {};
    mockResponseStatusCode = 200;
    mockResponseBody = JSON.stringify({ ok: true });
    shouldFailRequest = false;

    https.request.mockImplementation((options, callback) => {
      const res = {
        statusCode: mockResponseStatusCode,
        on: (event, handler) => {
          if (event === 'data') {
            handler(Buffer.from(mockResponseBody));
          }
          if (event === 'end') {
            handler();
          }
        }
      };

      return {
        write: jest.fn(),
        on: jest.fn((event, handler) => {
          errorListeners[event] = handler;
        }),
        end: jest.fn(() => {
          if (shouldFailRequest) {
            if (errorListeners['error']) {
              errorListeners['error'](new Error('HTTPS connection error'));
            }
          } else {
            callback(res);
          }
        })
      };
    });
  });

  it('should successfully process pending EMAIL notification and mark it SENT', async () => {
    const mockRecord = {
      id: 1,
      type: 'EMAIL',
      payload: {
        orderId: 10,
        code: 'ORD-123',
        email: 'customer@example.com',
        fullName: 'Jane Doe',
        totalFinal: 150000
      },
      status: 'PENDING',
      retries: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    prisma.notificationOutbox.findMany.mockResolvedValue([mockRecord]);

    await processOutbox();

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'no-reply@test.com',
        to: 'admin@test.com',
        subject: expect.stringContaining('ORD-123'),
        html: expect.stringContaining('Jane Doe')
      })
    );

    expect(prisma.notificationOutbox.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        status: 'SENT',
        error: null
      }
    });
  });

  it('should successfully process pending TELEGRAM notification and mark it SENT', async () => {
    const mockRecord = {
      id: 2,
      type: 'TELEGRAM',
      payload: {
        orderId: 10,
        code: 'ORD-123',
        message: 'New order ORD-123 placed'
      },
      status: 'PENDING',
      retries: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    prisma.notificationOutbox.findMany.mockResolvedValue([mockRecord]);

    await processOutbox();

    expect(https.request).toHaveBeenCalledWith(
      expect.objectContaining({
        hostname: 'api.telegram.org',
        path: '/botbot-token-123/sendMessage',
        method: 'POST'
      }),
      expect.any(Function)
    );

    expect(prisma.notificationOutbox.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: {
        status: 'SENT',
        error: null
      }
    });
  });

  it('should successfully process pending ZALO notification and mark it SENT', async () => {
    const mockRecord = {
      id: 20,
      type: 'ZALO',
      payload: {
        orderId: 10,
        code: 'ORD-123',
        message: 'New order ORD-123 placed'
      },
      status: 'PENDING',
      retries: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    prisma.notificationOutbox.findMany.mockResolvedValue([mockRecord]);

    await processOutbox();

    expect(https.request).toHaveBeenCalledWith(
      expect.objectContaining({
        hostname: 'openapi.zalo.me',
        path: '/v3.0/oa/message/cs',
        method: 'POST',
        headers: expect.objectContaining({
          'access_token': 'zalo-oa-token-123'
        })
      }),
      expect.any(Function)
    );

    expect(prisma.notificationOutbox.update).toHaveBeenCalledWith({
      where: { id: 20 },
      data: {
        status: 'SENT',
        error: null
      }
    });
  });

  it('should increment retries and keep PENDING status on dispatch failure under max limit', async () => {
    const mockRecord = {
      id: 3,
      type: 'EMAIL',
      payload: {
        orderId: 11,
        code: 'ORD-555',
        email: 'customer@example.com',
        fullName: 'John Doe',
        totalFinal: 200000
      },
      status: 'PENDING',
      retries: 1,
      createdAt: new Date(Date.now() - 10000),
      updatedAt: new Date(Date.now() - 5000) // 5 seconds ago > 2s backoff
    };

    prisma.notificationOutbox.findMany.mockResolvedValue([mockRecord]);
    mockSendMail.mockRejectedValue(new Error('SMTP connection timed out'));

    await processOutbox();

    expect(prisma.notificationOutbox.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: {
        status: 'PENDING',
        error: 'SMTP connection timed out',
        retries: 2
      }
    });
  });

  it('should set status to FAILED when retry count reaches max limits', async () => {
    const mockRecord = {
      id: 4,
      type: 'TELEGRAM',
      payload: {
        orderId: 12,
        code: 'ORD-666',
        message: 'Telegram failure test'
      },
      status: 'PENDING',
      retries: 4, // 5th retry, max_retries = 5
      createdAt: new Date(Date.now() - 30000),
      updatedAt: new Date(Date.now() - 20000) // 20 seconds ago > 16s backoff
    };

    prisma.notificationOutbox.findMany.mockResolvedValue([mockRecord]);
    shouldFailRequest = true;

    await processOutbox();

    expect(prisma.notificationOutbox.update).toHaveBeenCalledWith({
      where: { id: 4 },
      data: {
        status: 'FAILED',
        error: 'HTTPS connection error',
        retries: 5
      }
    });
  });

  it('should skip record processing if backoff duration has not expired', async () => {
    const now = new Date();
    // Record with retries = 2, so backoff is 2^2 = 4 seconds.
    // Last attempt (updatedAt) was 1 second ago.
    const mockRecord = {
      id: 5,
      type: 'EMAIL',
      payload: { code: 'ORD-999' },
      status: 'PENDING',
      retries: 2,
      createdAt: new Date(now.getTime() - 10000),
      updatedAt: new Date(now.getTime() - 1000)
    };

    prisma.notificationOutbox.findMany.mockResolvedValue([mockRecord]);

    await processOutbox();

    // Nodemailer should not be called since it is skipped
    expect(mockSendMail).not.toHaveBeenCalled();
    expect(prisma.notificationOutbox.update).not.toHaveBeenCalled();
  });

  it('should process record if backoff duration has expired', async () => {
    const now = new Date();
    // Record with retries = 2, so backoff is 2^2 = 4 seconds.
    // Last attempt (updatedAt) was 5 seconds ago (> 4 seconds).
    const mockRecord = {
      id: 6,
      type: 'EMAIL',
      payload: { code: 'ORD-999', email: 'test', fullName: 'test', totalFinal: 0 },
      status: 'PENDING',
      retries: 2,
      createdAt: new Date(now.getTime() - 10000),
      updatedAt: new Date(now.getTime() - 5000)
    };

    prisma.notificationOutbox.findMany.mockResolvedValue([mockRecord]);

    await processOutbox();

    expect(mockSendMail).toHaveBeenCalled();
    expect(prisma.notificationOutbox.update).toHaveBeenCalledWith({
      where: { id: 6 },
      data: {
        status: 'SENT',
        error: null
      }
    });
  });
});
