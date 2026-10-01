const request = require('supertest');
const app = require('../app');
const prisma = require('../config/prisma');
const env = require('../config/env');

// Rate limiting itself is covered by rateLimiter.test.js. authRateLimiter is
// shared (by IP) across register/login/google/forgot/reset-password, so
// exercising register and login in the same file would otherwise exhaust
// the real limiter's quota and produce false 429s here.
jest.mock('../middleware/rateLimiter', () => ({
  authRateLimiter: (req, res, next) => next(),
  testAuthRateLimiter: (req, res, next) => next(),
  checkoutRateLimiter: (req, res, next) => next(),
  testCheckoutRateLimiter: (req, res, next) => next(),
  recruitmentRateLimiter: (req, res, next) => next(),
  testRecruitmentRateLimiter: (req, res, next) => next(),
}));

// Mock Prisma client singleton
jest.mock('../config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  }
}));

describe('Authentication Routes - Register & Login', () => {
  const originalNodeEnv = env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    env.NODE_ENV = originalNodeEnv;
    env.ALLOW_ADMIN_PASSWORD_LOGIN = false;
  });

  afterAll(() => {
    env.NODE_ENV = originalNodeEnv;
    env.ALLOW_ADMIN_PASSWORD_LOGIN = false;
  });

  describe('POST /auth/register', () => {
    it('should fail registration with invalid input format', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'bad-email', password: '123', name: '' })
        .expect(400);

      expect(res.body.error).toBeDefined();
      expect(res.body.error.message).toBe('Validation failed');
    });

    it('should fail registration if email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'dup@example.com' });

      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'dup@example.com', password: 'password123', name: 'Dup User' })
        .expect(400);

      expect(res.body.error.message).toBe('Email is already registered');
    });

    it('should register successfully and return user details excluding password', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 2,
        email: 'new@example.com',
        name: 'New User',
        role: 'CUSTOMER',
        password: 'hashedpasswordhere',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'new@example.com', password: 'password123', name: 'New User' })
        .expect(201);

      expect(res.body.id).toBe(2);
      expect(res.body.email).toBe('new@example.com');
      expect(res.body.name).toBe('New User');
      expect(res.body.role).toBe('CUSTOMER');
      expect(res.body.password).toBeUndefined(); // Secure password check
    });
  });

  describe('POST /auth/login', () => {
    it('should fail login with validation errors', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'not-an-email', password: '' })
        .expect(400);

      expect(res.body.error.message).toBe('Validation failed');
    });

    it('should fail login if email not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password' })
        .expect(401);

      expect(res.body.error.message).toBe('Invalid email or password');
    });

    it('should fail login if password comparison fails', async () => {
      const { hashPassword } = require('../utils/hash');
      const hashedPassword = await hashPassword('correctpassword');

      prisma.user.findUnique.mockResolvedValue({
        id: 3,
        email: 'user@example.com',
        password: hashedPassword,
        name: 'User',
        role: 'CUSTOMER'
      });

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'wrongpassword' })
        .expect(401);

      expect(res.body.error.message).toBe('Invalid email or password');
    });

    it('should login successfully with an HttpOnly session and no token in JSON', async () => {
      const { hashPassword } = require('../utils/hash');
      const hashedPassword = await hashPassword('correctpassword');

      prisma.user.findUnique.mockResolvedValue({
        id: 3,
        email: 'user@example.com',
        password: hashedPassword,
        name: 'User',
        role: 'CUSTOMER'
      });

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'correctpassword' })
        .expect(200);

      expect(res.body.token).toBeUndefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.id).toBe(3);
      expect(res.body.user.email).toBe('user@example.com');
      expect(res.body.user.password).toBeUndefined(); // Secure password check
      const cookie = res.headers['set-cookie'][0];
      expect(cookie).toContain('ocseafood_session=');
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('SameSite=Lax');
      expect(cookie).not.toContain('Secure');
      expect(cookie).not.toContain('Max-Age');
    });

    it('should issue a persistent session only when remember-me is selected', async () => {
      const { hashPassword } = require('../utils/hash');
      const hashedPassword = await hashPassword('correctpassword');
      prisma.user.findUnique.mockResolvedValue({
        id: 3,
        email: 'user@example.com',
        password: hashedPassword,
        name: 'User',
        role: 'CUSTOMER'
      });

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'correctpassword', rememberMe: true })
        .expect(200);

      expect(res.headers['set-cookie'][0]).toContain('Max-Age=2592000');
    });

    it('should block ADMIN password login when the feature flag is disabled', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'admin@example.com',
        password: 'hashed-password',
        name: 'Admin',
        role: 'ADMIN'
      });

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'admin@example.com', password: 'correctpassword' })
        .expect(403);

      expect(res.body.error.message).toBe('Administrator accounts must sign in with Google.');
    });

    it('should block ADMIN password login even when the local testing flag is enabled', async () => {
      env.ALLOW_ADMIN_PASSWORD_LOGIN = true;

      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'admin@example.com',
        password: 'hashed-password',
        name: 'Admin',
        role: 'ADMIN'
      });

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'admin@example.com', password: 'correctpassword' })
        .expect(403);

      expect(res.body.error.message).toBe('Administrator accounts must sign in with Google.');
    });

    it('should always block ADMIN password login in production', async () => {
      env.NODE_ENV = 'production';
      env.ALLOW_ADMIN_PASSWORD_LOGIN = true;
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'admin@example.com',
        password: 'hashed-password',
        name: 'Admin',
        role: 'ADMIN'
      });

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'admin@example.com', password: 'correctpassword' })
        .expect(403);

      expect(res.body.error.message).toBe('Administrator accounts must sign in with Google.');
    });

    it('should use a Secure __Host- cookie in production for customer login', async () => {
      const { hashPassword } = require('../utils/hash');
      const hashedPassword = await hashPassword('correctpassword');
      env.NODE_ENV = 'production';
      prisma.user.findUnique.mockResolvedValue({
        id: 3,
        email: 'user@example.com',
        password: hashedPassword,
        name: 'User',
        role: 'CUSTOMER'
      });

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'correctpassword' })
        .expect(200);

      const cookie = res.headers['set-cookie'][0];
      expect(cookie).toContain('__Host-ocseafood_session=');
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('Secure');
      expect(cookie).toContain('Path=/');
    });
  });

  describe('Browser session lifecycle', () => {
    it('should restore the current user and clear the cookie on logout', async () => {
      const { hashPassword } = require('../utils/hash');
      const hashedPassword = await hashPassword('correctpassword');
      const user = {
        id: 3,
        email: 'user@example.com',
        password: hashedPassword,
        name: 'User',
        role: 'CUSTOMER'
      };
      prisma.user.findUnique.mockResolvedValue(user);

      const agent = request.agent(app);
      await agent
        .post('/auth/login')
        .send({ email: user.email, password: 'correctpassword' })
        .expect(200);

      const session = await agent.get('/auth/session').expect(200);
      expect(session.body.user.email).toBe(user.email);
      expect(session.body.user.password).toBeUndefined();
      expect(session.headers['cache-control']).toBe('no-store');

      const logout = await agent.post('/auth/logout').expect(204);
      expect(logout.headers['set-cookie'][0]).toContain('ocseafood_session=;');
      await agent.get('/auth/session').expect(401);
    });
  });
});
