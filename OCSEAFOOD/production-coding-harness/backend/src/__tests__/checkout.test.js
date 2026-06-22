const request = require('supertest');
const app = require('../app');
const prisma = require('../config/prisma');
const { signToken } = require('../utils/jwt');

// Mock rate limiter request count
let mockRequestCount = 0;

jest.mock('../middleware/rateLimiter', () => {
  return {
    authRateLimiter: (req, res, next) => next(),
    testAuthRateLimiter: (req, res, next) => next(),
    checkoutRateLimiter: (req, res, next) => next(),
    testCheckoutRateLimiter: (req, res, next) => {
      mockRequestCount++;
      if (mockRequestCount > 3) {
        return res.status(429).json({
          error: { message: 'Too many requests, please try again later', status: 429 }
        });
      }
      next();
    }
  };
});

// Mock Prisma client singleton
jest.mock('../config/prisma', () => {
  const mockPrisma = {
    product: {
      findMany: jest.fn(),
    },
    order: {
      create: jest.fn(),
    },
    orderItem: {
      create: jest.fn(),
    },
    notificationOutbox: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  return mockPrisma;
});

describe('Virtual Checkout API - POST /checkout', () => {
  let customerToken;
  const mockProducts = [
    { id: 1, name: 'Lobster', unit: 'kg', priceReference: 1200000, isVisible: true, showContact: false },
    { id: 2, name: 'Salmon', unit: 'pcs', priceReference: 350000, isVisible: true, showContact: false },
  ];

  beforeAll(() => {
    customerToken = signToken({ id: 5, email: 'customer@example.com', role: 'CUSTOMER' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestCount = 0; // Reset rate limiter request count for isolation

    // Default transaction mock executes callback synchronously passing the client mock
    prisma.$transaction.mockImplementation(async (callback) => {
      return callback(prisma);
    });
  });

  it('should successfully checkout as a Guest (no authentication token)', async () => {
    prisma.product.findMany.mockResolvedValue([mockProducts[0]]);
    prisma.order.create.mockResolvedValue({
      id: 1,
      code: 'ORD-12345678-ABCD',
      fullName: 'Guest User',
      email: 'guest@example.com',
      phone: '0987654321',
      province: 'Hanoi',
      district: 'Hoan Kiem',
      ward: 'Hang Bac',
      streetAddress: '12 Hang Bac',
      totalEstimated: 1200000,
      totalFinal: 1200000,
      userId: null
    });

    const payload = {
      fullName: 'Guest User',
      email: 'guest@example.com',
      phone: '0987654321',
      province: 'Hanoi',
      district: 'Hoan Kiem',
      ward: 'Hang Bac',
      streetAddress: '12 Hang Bac',
      items: [{ productId: 1, quantity: 1 }],
    };

    const res = await request(app)
      .post('/checkout')
      .send(payload)
      .expect(201);

    expect(res.body.userId).toBeNull();
    expect(prisma.order.create).toHaveBeenCalled();
    expect(prisma.notificationOutbox.create).toHaveBeenCalledTimes(3); // EMAIL, TELEGRAM & ZALO
  });

  it('should successfully checkout as a Customer and link userId', async () => {
    prisma.product.findMany.mockResolvedValue([mockProducts[1]]);
    prisma.order.create.mockResolvedValue({
      id: 2,
      code: 'ORD-12345678-EFGH',
      fullName: 'Customer User',
      email: 'customer@example.com',
      phone: '0912345678',
      province: 'HCM',
      district: 'District 1',
      ward: 'Ben Nghe',
      streetAddress: '10 Ben Nghe',
      totalEstimated: 700000,
      totalFinal: 700000,
      userId: 5
    });

    const payload = {
      fullName: 'Customer User',
      email: 'customer@example.com',
      phone: '0912345678',
      province: 'HCM',
      district: 'District 1',
      ward: 'Ben Nghe',
      streetAddress: '10 Ben Nghe',
      items: [{ productId: 2, quantity: 2 }],
    };

    const res = await request(app)
      .post('/checkout')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(payload)
      .expect(201);

    expect(res.body.userId).toBe(5);
  });

  it('should ignore client-supplied pricing and calculate using DB priceReference', async () => {
    prisma.product.findMany.mockResolvedValue([mockProducts[0]]);
    prisma.order.create.mockImplementation(({ data }) => {
      return Promise.resolve({
        id: 3,
        ...data,
        totalEstimated: data.totalEstimated,
        totalFinal: data.totalFinal,
      });
    });

    const payload = {
      fullName: 'Pricing Test',
      email: 'pricing@example.com',
      phone: '0987654321',
      province: 'Hanoi',
      district: 'Hoan Kiem',
      ward: 'Hang Bac',
      streetAddress: '12 Hang Bac',
      items: [{ productId: 1, quantity: 2, price: 100 }], // Forged low price
    };

    const res = await request(app)
      .post('/checkout')
      .send(payload)
      .expect(201);

    expect(res.body.totalFinal).toBe(2400000); // 1,200,000 * 2 (Correct calculation)
  });

  it('should block checkout with 400 if validation fails', async () => {
    const payload = {
      fullName: '', // Invalid empty name
      email: 'invalid-email', // Bad email
      phone: '123456', // Bad phone
      province: 'Hanoi',
      district: 'Hoan Kiem',
      ward: 'Hang Bac',
      streetAddress: '12 Hang Bac',
      items: [], // Empty items array
    };

    await request(app)
      .post('/checkout')
      .send(payload)
      .expect(400);
  });

  it('should return 400 if product in items is not found', async () => {
    prisma.product.findMany.mockResolvedValue([]); // Empty results (product not found)

    const payload = {
      fullName: 'Product Test',
      email: 'product@example.com',
      phone: '0987654321',
      province: 'Hanoi',
      district: 'Hoan Kiem',
      ward: 'Hang Bac',
      streetAddress: '12 Hang Bac',
      items: [{ productId: 999, quantity: 1 }],
    };

    await request(app)
      .post('/checkout')
      .send(payload)
      .expect(400);
  });

  it('should reject hidden or contact-only products', async () => {
    prisma.product.findMany.mockResolvedValue([
      { id: 3, name: 'Contact Crab', unit: 'kg', priceReference: null, isVisible: true, showContact: true },
    ]);

    const payload = {
      fullName: 'Contact Product Test',
      email: 'contact@example.com',
      phone: '0987654321',
      province: 'Hanoi',
      district: 'Hoan Kiem',
      ward: 'Hang Bac',
      streetAddress: '12 Hang Bac',
      items: [{ productId: 3, quantity: 1 }],
    };

    const res = await request(app)
      .post('/checkout')
      .send(payload)
      .expect(400);

    expect(res.body.error.message).toBe('Product with ID 3 is not available for checkout');
    expect(prisma.order.create).not.toHaveBeenCalled();
  });

  it('should apply rate limiting to checkout API', async () => {
    prisma.product.findMany.mockResolvedValue([mockProducts[0]]);
    prisma.order.create.mockResolvedValue({ id: 10 });

    const payload = {
      fullName: 'Rate Limit User',
      email: 'ratelimit@example.com',
      phone: '0987654321',
      province: 'Hanoi',
      district: 'Hoan Kiem',
      ward: 'Hang Bac',
      streetAddress: '12 Hang Bac',
      items: [{ productId: 1, quantity: 1 }],
    };

    // The test rate limiter allows 3 requests per window.
    // Send 3 requests which should pass.
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post('/checkout')
        .send(payload)
        .expect(201);
    }

    // The 4th request must be rate limited with 429
    const res = await request(app)
      .post('/checkout')
      .send(payload)
      .expect(429);

    expect(res.body.error.message).toBe('Too many requests, please try again later');
  });
});
