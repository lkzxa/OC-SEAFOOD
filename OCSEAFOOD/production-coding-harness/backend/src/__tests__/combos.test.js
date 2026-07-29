const request = require('supertest');
const app = require('../app');
const prisma = require('../config/prisma');
const { signToken } = require('../utils/jwt');

// Mock Prisma client singleton
jest.mock('../config/prisma', () => {
  const mockPrisma = {
    combo: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
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

// Mock rate limiters to prevent 429 errors in tests
jest.mock('../middleware/rateLimiter', () => ({
  authRateLimiter: (req, res, next) => next(),
  checkoutRateLimiter: (req, res, next) => next(),
  testAuthRateLimiter: (req, res, next) => next(),
  testCheckoutRateLimiter: (req, res, next) => next(),
}));

describe('Combos API & Checkout Integration', () => {
  let adminToken;
  let customerToken;

  beforeAll(() => {
    adminToken = signToken({ id: 1, email: 'admin@ocseafood.vn', role: 'ADMIN' });
    customerToken = signToken({ id: 2, email: 'customer@example.com', role: 'CUSTOMER' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async (callback) => {
      if (typeof callback === 'function') {
        return callback(prisma);
      }
      return callback;
    });
  });

  describe('GET /combos - Public visible list', () => {
    it('should return visible combos list with 200', async () => {
      const mockList = [
        { id: 1, name: 'Royal Combo', slug: 'royal-combo', isVisible: true },
      ];
      prisma.combo.findMany.mockResolvedValue(mockList);

      const res = await request(app)
        .get('/combos')
        .expect(200);

      expect(res.body).toEqual(mockList);
      expect(prisma.combo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isVisible: true } })
      );
    });
  });

  describe('GET /combos/slug/:slug - Public detail by slug', () => {
    it('should return combo detail if found', async () => {
      const mockCombo = { id: 1, name: 'Royal Combo', slug: 'royal-combo', isVisible: true };
      prisma.combo.findUnique.mockResolvedValue(mockCombo);

      const res = await request(app)
        .get('/combos/slug/royal-combo')
        .expect(200);

      expect(res.body).toEqual(mockCombo);
    });

    it('should return 404 if combo is not found', async () => {
      prisma.combo.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get('/combos/slug/nonexistent-combo')
        .expect(404);

      expect(res.body.error.message).toContain('not found');
    });
  });

  describe('GET /combos/:id - Public/Admin detail by ID', () => {
    it('should return combo detail by ID if found', async () => {
      const mockCombo = { id: 10, name: 'Royal Combo', slug: 'royal-combo', isVisible: true };
      prisma.combo.findUnique.mockResolvedValue(mockCombo);

      const res = await request(app)
        .get('/combos/10')
        .expect(200);

      expect(res.body).toEqual(mockCombo);
      expect(prisma.combo.findUnique).toHaveBeenCalledWith({ where: { id: 10 } });
    });

    it('should return 400 if ID format is invalid', async () => {
      const res = await request(app)
        .get('/combos/invalid-id')
        .expect(400);

      expect(res.body.error.message).toContain('ID format');
    });

    it('should return 404 if combo ID is not found', async () => {
      prisma.combo.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get('/combos/999')
        .expect(404);

      expect(res.body.error.message).toContain('not found');
    });
  });

  describe('GET /combos/admin - Admin view list', () => {
    it('should block non-admins with 403', async () => {
      await request(app)
        .get('/combos/admin')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });

    it('should allow admins to retrieve visible and hidden combos', async () => {
      const mockList = [
        { id: 1, name: 'Combo 1', isVisible: true },
        { id: 2, name: 'Combo 2', isVisible: false },
      ];
      prisma.combo.findMany.mockResolvedValue(mockList);

      const res = await request(app)
        .get('/combos/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toEqual(mockList);
    });
  });

  describe('POST /combos - Admin only create', () => {
    const validPayload = {
      name: 'Combo A',
      slug: 'combo-a',
      description: 'Mô tả ngắn',
      price: 1500000,
      image: '/uploads/combo-a.jpg',
      items: ['Thành phần 1', 'Thành phần 2'],
      isVisible: true,
    };

    it('should block non-admins with 403', async () => {
      await request(app)
        .post('/combos')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(validPayload)
        .expect(403);
    });

    it('should validate payload structure and return 400 on error', async () => {
      await request(app)
        .post('/combos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '' }) // missing required fields
        .expect(400);
    });

    it('should fail if slug already exists', async () => {
      prisma.combo.findUnique.mockResolvedValue({ id: 99, slug: 'combo-a' });

      const res = await request(app)
        .post('/combos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validPayload)
        .expect(400);

      expect(res.body.error.message).toContain('Slug already exists');
    });

    it('should create new combo successfully as admin', async () => {
      prisma.combo.findUnique.mockResolvedValue(null);
      prisma.combo.create.mockResolvedValue({ id: 5, ...validPayload });

      const res = await request(app)
        .post('/combos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validPayload)
        .expect(201);

      expect(res.body.id).toBe(5);
      expect(prisma.combo.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ slug: 'combo-a' }) })
      );
    });
  });

  describe('Checkout Integration with Combo', () => {
    it('should validate and process checkout with combo items successfully', async () => {
      const mockCombo = {
        id: 9001,
        name: 'Super Combo',
        price: 2500000,
        isVisible: true,
      };

      prisma.product.findMany.mockResolvedValue([]); // No regular products in this order
      prisma.combo.findMany.mockResolvedValue([mockCombo]);
      prisma.order.create.mockResolvedValue({
        id: 111,
        code: 'ORD-COMBOTEST',
        totalFinal: 2500000,
      });

      const res = await request(app)
        .post('/checkout')
        .send({
          fullName: 'John Doe',
          email: 'customer@example.com',
          phone: '0912345678',
          province: 'Hồ Chí Minh',
          district: 'Quận 1',
          ward: 'Bến Nghé',
          streetAddress: '123 Nguyễn Huệ',
          items: [
            { productId: 9001, quantity: 1, isCombo: true },
          ],
        })
        .expect(201);

      expect(res.body.id).toBe(111);
      expect(prisma.combo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: { in: [9001] } } })
      );
    });
  });
});
