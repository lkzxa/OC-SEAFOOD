const request = require('supertest');
const app = require('../app');
const prisma = require('../config/prisma');
const { signToken } = require('../utils/jwt');

jest.mock('../config/prisma', () => ({
  order: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    update: jest.fn()
  },
  orderItem: {
    update: jest.fn(),
    findMany: jest.fn()
  },
  orderAuditLog: {
    create: jest.fn()
  },
  $transaction: jest.fn()
}));

describe('Orders Management API - /orders', () => {
  let customerToken1;
  let customerToken2;
  let adminToken;

  beforeAll(() => {
    customerToken1 = signToken({ id: 5, email: 'cust1@example.com', role: 'CUSTOMER' });
    customerToken2 = signToken({ id: 10, email: 'cust2@example.com', role: 'CUSTOMER' });
    adminToken = signToken({ id: 2, email: 'admin@example.com', role: 'ADMIN' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async (callback) => callback(prisma));
  });

  describe('GET /orders (List)', () => {
    it('should block Guest and Customer requests', async () => {
      await request(app).get('/orders').expect(401);
      await request(app).get('/orders').set('Authorization', `Bearer ${customerToken1}`).expect(403);
    });

    it('should return paginated list of orders for Admin', async () => {
      prisma.order.findMany.mockResolvedValue([]);
      prisma.order.count.mockResolvedValue(0);

      const res = await request(app)
        .get('/orders?page=2&pageSize=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.pagination.page).toBe(2);
      expect(res.body.pagination.pageSize).toBe(5);
    });
  });

  describe('GET /orders/:id (Detail)', () => {
    it('should allow Admin to retrieve detail', async () => {
      const mockOrder = { id: 1, userId: 5, totalFinal: 100000, orderItems: [] };
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      const res = await request(app)
        .get('/orders/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.id).toBe(1);
    });

    it('should allow Owner Customer to retrieve detail', async () => {
      const mockOrder = { id: 1, userId: 5, totalFinal: 100000, orderItems: [] };
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      const res = await request(app)
        .get('/orders/1')
        .set('Authorization', `Bearer ${customerToken1}`) // id: 5 matches
        .expect(200);

      expect(res.body.id).toBe(1);
    });

    it('should reject Non-owner Customer with 403', async () => {
      const mockOrder = { id: 1, userId: 5, totalFinal: 100000, orderItems: [] };
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      await request(app)
        .get('/orders/1')
        .set('Authorization', `Bearer ${customerToken2}`) // id: 10 (mismatch)
        .expect(403);
    });
  });

  describe('PUT /orders/:id (Update)', () => {
    it('should block non-admins from updating orders', async () => {
      await request(app)
        .put('/orders/1')
        .set('Authorization', `Bearer ${customerToken1}`)
        .send({ status: 'CONFIRMED' })
        .expect(403);
    });

    it('should update status and note, and keep adminPriceAdjusted as false', async () => {
      const mockOrder = { id: 1, userId: 5, status: 'PENDING', note: null, totalFinal: 100000, adminPriceAdjusted: false, orderItems: [] };
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.order.update.mockImplementation(({ data }) => Promise.resolve({ ...mockOrder, ...data }));

      const res = await request(app)
        .put('/orders/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'CONFIRMED', note: 'Done' })
        .expect(200);

      expect(res.body.status).toBe('CONFIRMED');
      expect(res.body.note).toBe('Done');
      expect(res.body.adminPriceAdjusted).toBe(false);
    });

    it('should update item prices and set adminPriceAdjusted to true', async () => {
      const mockOrder = {
        id: 1,
        userId: 5,
        status: 'PENDING',
        totalFinal: 100000,
        adminPriceAdjusted: false,
        orderItems: [{ id: 10, quantity: 1, priceFinal: 100000, totalFinal: 100000 }]
      };
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.orderItem.findMany.mockResolvedValue([{ id: 10, totalFinal: 150000 }]);
      prisma.order.update.mockImplementation(({ data }) => Promise.resolve({ ...mockOrder, ...data }));

      const res = await request(app)
        .put('/orders/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ items: [{ id: 10, quantity: 1, priceFinal: 150000 }] })
        .expect(200);

      expect(res.body.adminPriceAdjusted).toBe(true);
      expect(res.body.totalFinal).toBe(150000);
    });

    it('should reject item updates for items that do not belong to the order', async () => {
      const mockOrder = {
        id: 1,
        userId: 5,
        status: 'PENDING',
        totalFinal: 100000,
        adminPriceAdjusted: false,
        orderItems: [{ id: 10, quantity: 1, priceFinal: 100000, totalFinal: 100000 }]
      };
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      const res = await request(app)
        .put('/orders/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ items: [{ id: 999, quantity: 1, priceFinal: 150000 }] })
        .expect(400);

      expect(res.body.error.message).toBe('Order item with ID 999 does not belong to this order');
      expect(prisma.orderItem.update).not.toHaveBeenCalled();
      expect(prisma.order.update).not.toHaveBeenCalled();
    });
  });
});
