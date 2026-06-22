const request = require('supertest');
const app = require('../app');
const prisma = require('../config/prisma');

// Mock Prisma client singleton
jest.mock('../config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  }
}));

describe('Authentication Routes - Register & Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

    it('should login successfully and return signed token and user info without password', async () => {
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

      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.id).toBe(3);
      expect(res.body.user.email).toBe('user@example.com');
      expect(res.body.user.password).toBeUndefined(); // Secure password check
    });
  });
});
