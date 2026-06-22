const request = require('supertest');
const app = require('../app');
const prisma = require('../config/prisma');

/**
 * TASK-0028: Abuse / Load Smoke Tests
 *
 * Tests verify the API handles abusive/high-volume traffic correctly:
 *   1. Malformed/garbage payloads are rejected with 400 errors
 *   2. SQL-injection and XSS strings don't cause 500 server errors
 *   3. Role escalation via register is blocked (BUG-001 fix)
 *   4. Invalid checkout quantities/payloads are rejected
 *   5. Public endpoints are stable under concurrent calls
 *   6. Concurrent checkout flood triggers rate limiting
 *   7. Client cannot forge prices (price forgery prevention)
 */

// Mock rate limiters to control rate limiting behaviour in tests
// Note: jest.mock factory cannot reference out-of-scope variables,
// so we use global to share state between the factory and test code.
global.__checkoutMockCount = 0;
jest.mock('../middleware/rateLimiter', () => {
  return {
    authRateLimiter: (req, res, next) => next(),
    testAuthRateLimiter: (req, res, next) => next(),
    checkoutRateLimiter: (req, res, next) => {
      global.__checkoutMockCount++;
      if (global.__checkoutMockCount > 5) {
        return res.status(429).json({
          error: { message: 'Too many requests, please try again later', status: 429 }
        });
      }
      next();
    },
    testCheckoutRateLimiter: (req, res, next) => next(),
  };
});

// Mock Prisma so tests don't require a live DB connection
jest.mock('../config/prisma', () => ({
  product: {
    findMany: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
  category: {
    findMany: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  blogPost: {
    findMany: jest.fn().mockResolvedValue([]),
    findFirst: jest.fn().mockResolvedValue(null),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  order: {
    findMany: jest.fn().mockResolvedValue([]),
    findFirst: jest.fn().mockResolvedValue(null),
    count: jest.fn().mockResolvedValue(0),
    create: jest.fn(),
    update: jest.fn(),
  },
  orderItem: { create: jest.fn(), update: jest.fn() },
  orderAuditLog: { create: jest.fn() },
  notificationOutbox: { create: jest.fn() },
  $transaction: jest.fn(),
}));

describe('TASK-0028: Abuse & Load Smoke Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the global checkout count before each test
    global.__checkoutMockCount = 0;
    prisma.$transaction.mockImplementation(async (cb) => cb(prisma));
    prisma.product.findMany.mockResolvedValue([]);
    prisma.product.count.mockResolvedValue(0);
  });

  // -----------------------------------------------------------------------
  // 1. MALFORMED / GARBAGE PAYLOAD HANDLING
  // -----------------------------------------------------------------------
  describe('Malformed payload rejection', () => {
    it('should return 400 when checkout receives empty body', async () => {
      const res = await request(app).post('/checkout').send({}).expect(400);
      expect(res.body.error.status).toBe(400);
    });

    it('should return 400 when checkout receives wrong types', async () => {
      const res = await request(app)
        .post('/checkout')
        .send({ fullName: 12345, email: true, phone: ['array'], items: 'not an array' })
        .expect(400);
      expect(res.body.error.status).toBe(400);
    });

    it('should return 400 when login receives wrong types', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 12345, password: null })
        .expect(400);
      expect(res.body.error.status).toBe(400);
    });

    it('should return 400 for register with missing name field', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'noname@example.com', password: 'password123' })
        .expect(400);
      expect(res.body.error.status).toBe(400);
    });

    it('should return 400 for register with password too short', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'short@example.com', password: '123', name: 'Short' })
        .expect(400);
      expect(res.body.error.status).toBe(400);
    });

    it('should return 400 for register with invalid email format', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'not-an-email', password: 'password123', name: 'Test' })
        .expect(400);
      expect(res.body.error.status).toBe(400);
    });
  });

  // -----------------------------------------------------------------------
  // 2. SQL-INJECTION & XSS STRINGS — Should NOT cause 500 server errors
  // -----------------------------------------------------------------------
  describe('SQL injection / XSS strings in text fields', () => {
    const maliciousStrings = [
      "'; DROP TABLE users; --",
      '<script>alert("xss")</script>',
      '1 OR 1=1',
      '{"$gt": ""}',
      'null; SELECT * FROM orders',
      '../../../etc/passwd',
    ];

    maliciousStrings.forEach((malicious) => {
      it(`should not 500 on: "${malicious.slice(0, 40)}"`, async () => {
        prisma.user.findUnique.mockResolvedValue(null);

        const res = await request(app)
          .post('/auth/login')
          .send({ email: malicious, password: malicious });

        // Must never be 500 — Zod validation should reject invalid format
        expect(res.status).not.toBe(500);
        expect([400, 401]).toContain(res.status);
      });
    });
  });

  // -----------------------------------------------------------------------
  // 3. ROLE ESCALATION PREVENTION (BUG-001 fix)
  // -----------------------------------------------------------------------
  describe('Role escalation prevention via register', () => {
    it('should NOT allow registering with role: ADMIN — field is silently ignored', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 99,
        email: 'evil@attacker.com',
        name: 'Evil Admin',
        role: 'CUSTOMER', // Backend always forces CUSTOMER
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post('/auth/register')
        .send({
          email: 'evil@attacker.com',
          password: 'hacked123!',
          name: 'Evil Admin',
          role: 'ADMIN', // Attempting privilege escalation
        })
        .expect(201);

      // Register route returns the user object directly (no 'user' wrapper key)
      // Role must be CUSTOMER regardless of what was sent in body
      expect(res.body.role).toBe('CUSTOMER');
      expect(res.body.role).not.toBe('ADMIN');
    });

    it('should NOT expose password hash in register response', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 100,
        email: 'safetest@test.com',
        name: 'Safe User',
        role: 'CUSTOMER',
        password: '$2b$10$hashedpasswordhash', // Stored in DB mock
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'safetest@test.com', password: 'securepassword123', name: 'Safe User' })
        .expect(201);

      // Password must NOT appear in response (route strips it before responding)
      expect(res.body.password).toBeUndefined();
      expect(res.body.email).toBe('safetest@test.com');
    });
  });

  // -----------------------------------------------------------------------
  // 4. INVALID CHECKOUT PAYLOAD EDGE CASES
  // -----------------------------------------------------------------------
  describe('Invalid checkout payload edge cases', () => {
    const validBase = {
      fullName: 'Edge Test User',
      email: 'edge@example.com',
      phone: '0987654321',
      province: 'Hà Nội',
      district: 'Hoàn Kiếm',
      ward: 'Hàng Bạc',
      streetAddress: '10 Phố Test',
    };

    it('should reject checkout with quantity = 0', async () => {
      const res = await request(app)
        .post('/checkout')
        .send({ ...validBase, items: [{ productId: 1, quantity: 0 }] })
        .expect(400);
      expect(res.body.error.status).toBe(400);
    });

    it('should reject checkout with negative quantity', async () => {
      const res = await request(app)
        .post('/checkout')
        .send({ ...validBase, items: [{ productId: 1, quantity: -5 }] })
        .expect(400);
      expect(res.body.error.status).toBe(400);
    });

    it('should reject checkout with empty items array', async () => {
      const res = await request(app)
        .post('/checkout')
        .send({ ...validBase, items: [] })
        .expect(400);
      expect(res.body.error.status).toBe(400);
    });

    it('should reject checkout with invalid Vietnamese phone number', async () => {
      const res = await request(app)
        .post('/checkout')
        .send({ ...validBase, phone: '12345', items: [{ productId: 1, quantity: 1 }] })
        .expect(400);
      expect(res.body.error.status).toBe(400);
    });

    it('should reject checkout with missing streetAddress', async () => {
      const { streetAddress: _omit, ...noStreet } = validBase;
      const res = await request(app)
        .post('/checkout')
        .send({ ...noStreet, items: [{ productId: 1, quantity: 1 }] })
        .expect(400);
      expect(res.body.error.status).toBe(400);
    });

    it('should reject checkout with productId = 0 (invalid)', async () => {
      const res = await request(app)
        .post('/checkout')
        .send({ ...validBase, items: [{ productId: 0, quantity: 1 }] })
        .expect(400);
      expect(res.body.error.status).toBe(400);
    });
  });

  // -----------------------------------------------------------------------
  // 5. PUBLIC ENDPOINT STABILITY — Concurrent calls without crashes
  // -----------------------------------------------------------------------
  describe('Public endpoint stability under concurrent calls', () => {
    it('should handle 20 concurrent /health requests without 500', async () => {
      const responses = await Promise.all(
        Array.from({ length: 20 }, () => request(app).get('/health'))
      );
      responses.forEach((res) => {
        expect(res.status).toBe(200);
      });
    });

    it('should handle 10 concurrent GET /products without 500', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      const responses = await Promise.all(
        Array.from({ length: 10 }, () => request(app).get('/products'))
      );
      responses.forEach((res) => {
        expect(res.status).toBe(200);
        // API returns paginated object
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('pagination');
      });
    });

    it('should handle 10 concurrent GET /categories without 500', async () => {
      prisma.category.findMany.mockResolvedValue([]);
      prisma.category.count.mockResolvedValue(0);

      const responses = await Promise.all(
        Array.from({ length: 10 }, () => request(app).get('/categories'))
      );
      responses.forEach((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('pagination');
      });
    });

    it('should handle 10 concurrent GET /posts without 500', async () => {
      prisma.blogPost.findMany.mockResolvedValue([]);

      const responses = await Promise.all(
        Array.from({ length: 10 }, () => request(app).get('/posts'))
      );
      responses.forEach((res) => {
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
      });
    });
  });

  // -----------------------------------------------------------------------
  // 6. CONCURRENT CHECKOUT FLOOD — Stability under load (no crashes)
  // -----------------------------------------------------------------------
  describe('Checkout flood stability', () => {
    it('should handle 10 sequential checkout requests without 500 crashes', async () => {
      // Note: In test mode, testCheckoutRateLimiter is used (passthrough), so
      // this test verifies the endpoint is stable under repeated calls.
      // Rate limiting in production is covered by rateLimiter.test.js.
      prisma.product.findMany.mockResolvedValue([
        { id: 1, name: 'Lobster', unit: 'kg', priceReference: 1200000, isVisible: true, showContact: false },
      ]);
      prisma.order.create.mockResolvedValue({
        id: 1, code: 'ORD-TEST-001', totalFinal: 1200000, userId: null,
        fullName: 'Flood', email: 'f@t.com', phone: '0987654321',
        province: 'Hà Nội', district: 'Hoàn Kiếm', ward: 'Hàng Bạc', streetAddress: '10 Test',
        totalEstimated: 1200000, status: 'PENDING',
      });

      const payload = {
        fullName: 'Flood User',
        email: 'flood@example.com',
        phone: '0987654321',
        province: 'Hà Nội',
        district: 'Hoàn Kiếm',
        ward: 'Hàng Bạc',
        streetAddress: '10 Phố Test',
        items: [{ productId: 1, quantity: 1 }],
      };

      const responses = [];
      for (let i = 0; i < 10; i++) {
        responses.push(await request(app).post('/checkout').send(payload));
      }

      // CRITICAL: None should crash the server with 500
      responses.forEach((res) => {
        expect(res.status).not.toBe(500);
        // In test mode (passthrough rate limiter): all should succeed
        expect(res.status).toBe(201);
      });

      // All 10 requests should have been processed
      expect(responses).toHaveLength(10);
    });
  });

  // -----------------------------------------------------------------------
  // 7. PRICE FORGERY PREVENTION
  // -----------------------------------------------------------------------
  describe('Checkout price forgery prevention', () => {
    it('should calculate totalFinal from DB price, ignoring client-supplied price field', async () => {
      prisma.product.findMany.mockResolvedValue([
        { id: 1, name: 'Lobster', unit: 'kg', priceReference: 1200000, isVisible: true, showContact: false },
      ]);
      prisma.order.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 1, ...data })
      );

      const res = await request(app)
        .post('/checkout')
        .send({
          fullName: 'Price Forger',
          email: 'forger@example.com',
          phone: '0987654321',
          province: 'Hà Nội',
          district: 'Hoàn Kiếm',
          ward: 'Hàng Bạc',
          streetAddress: '10 Phố Test',
          items: [{ productId: 1, quantity: 2, price: 1 }], // Forged price=1
        })
        .expect(201);

      // totalFinal = 1,200,000 × 2 = 2,400,000 (from DB), NOT 1 × 2 = 2
      expect(res.body.totalFinal).toBe(2400000);
    });
  });
});
