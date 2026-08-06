const request = require('supertest');
const app = require('../app');
const prisma = require('../config/prisma');
const crypto = require('crypto');

// Mock Prisma client singleton
jest.mock('../config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    update: jest.fn()
  },
  passwordResetToken: {
    upsert: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn()
  },
  notificationOutbox: {
    create: jest.fn()
  },
  $transaction: jest.fn()
}));

// Mock rate limiters to prevent 429 Too Many Requests in tests
jest.mock('../middleware/rateLimiter', () => ({
  authRateLimiter: (req, res, next) => next(),
  checkoutRateLimiter: (req, res, next) => next(),
  testAuthRateLimiter: (req, res, next) => next(),
  testCheckoutRateLimiter: (req, res, next) => next(),
  recruitmentRateLimiter: (req, res, next) => next(),
  testRecruitmentRateLimiter: (req, res, next) => next(),
}));

describe('Password Reset Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async (callback) => {
      if (typeof callback === 'function') {
        return callback(prisma);
      }
      return callback; // In case it's an array of queries
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should fail with 400 if email is invalid', async () => {
      const res = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'not-an-email' })
        .expect(400);

      expect(res.body.error.message).toBe('Validation failed');
    });

    it('should return 200 even if user does not exist (privacy preservation)', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(res.body.message).toContain('hướng dẫn đặt lại mật khẩu đã được gửi');
      expect(prisma.passwordResetToken.upsert).not.toHaveBeenCalled();
      expect(prisma.notificationOutbox.create).not.toHaveBeenCalled();
    });

    it('should generate token, save it hashed, queue email outbox, and return 200', async () => {
      const mockUser = {
        id: 10,
        email: 'customer@example.com',
        name: 'John Doe',
        role: 'CUSTOMER'
      };
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.passwordResetToken.upsert.mockResolvedValue({});
      prisma.notificationOutbox.create.mockResolvedValue({});

      const res = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'customer@example.com' })
        .expect(200);

      expect(res.body.message).toContain('hướng dẫn đặt lại mật khẩu đã được gửi');
      expect(prisma.passwordResetToken.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUser.id },
          create: expect.objectContaining({
            userId: mockUser.id,
            tokenHash: expect.any(String),
            expiresAt: expect.any(Date)
          })
        })
      );
      expect(prisma.notificationOutbox.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'EMAIL',
            payload: expect.objectContaining({
              to: 'customer@example.com',
              subject: expect.any(String),
              html: expect.stringContaining('Đặt lại mật khẩu')
            })
          })
        })
      );
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should fail with 400 if validation fails (e.g. password too short)', async () => {
      const res = await request(app)
        .post('/auth/reset-password')
        .send({ token: 'some-token', password: '123' }) // password too short
        .expect(400);

      expect(res.body.error.message).toBe('Validation failed');
    });

    it('should fail with 400 if token is invalid or expired', async () => {
      prisma.passwordResetToken.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .post('/auth/reset-password')
        .send({ token: 'invalid-token', password: 'newpassword123' })
        .expect(400);

      expect(res.body.error.message).toContain('không hợp lệ hoặc đã hết hạn');
    });

    it('should reset password successfully and delete token if token is valid', async () => {
      const mockResetToken = {
        id: 55,
        userId: 10,
        tokenHash: 'hashed-token-here',
        expiresAt: new Date(Date.now() + 100000),
        user: {
          id: 10,
          email: 'customer@example.com',
          name: 'John Doe'
        }
      };

      prisma.passwordResetToken.findFirst.mockResolvedValue(mockResetToken);
      prisma.user.update.mockResolvedValue({ id: 10 });
      prisma.passwordResetToken.delete.mockResolvedValue({});

      const res = await request(app)
        .post('/auth/reset-password')
        .send({ token: 'valid-token', password: 'newsecurepassword123' })
        .expect(200);

      expect(res.body.message).toBe('Đặt lại mật khẩu thành công!');
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 10 },
          data: expect.objectContaining({
            password: expect.any(String) // Hashed password
          })
        })
      );
      expect(prisma.passwordResetToken.delete).toHaveBeenCalledWith({
        where: { id: mockResetToken.id }
      });
    });
  });
});
