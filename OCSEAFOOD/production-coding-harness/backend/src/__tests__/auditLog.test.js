const request = require('supertest');
const app = require('../app');
const prisma = require('../config/prisma');
const { signToken } = require('../utils/jwt');

jest.mock('../config/prisma', () => ({
  order: {
    findUnique: jest.fn(),
    update: jest.fn()
  },
  orderItem: {
    update: jest.fn()
  },
  orderAuditLog: {
    create: jest.fn()
  },
  $transaction: jest.fn()
}));

describe('Order Audit Logging - PUT /orders/:id', () => {
  let adminToken;

  beforeAll(() => {
    adminToken = signToken({ id: 2, email: 'admin@example.com', role: 'ADMIN' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async (callback) => callback(prisma));
  });

  it('should create an OrderAuditLog record when status is updated', async () => {
    const mockOrder = {
      id: 1,
      userId: 5,
      status: 'PENDING',
      note: null,
      totalFinal: 100000,
      adminPriceAdjusted: false,
      orderItems: []
    };

    prisma.order.findUnique.mockResolvedValue(mockOrder);
    prisma.order.update.mockResolvedValue({ ...mockOrder, status: 'CONFIRMED' });

    await request(app)
      .put('/orders/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'CONFIRMED' })
      .expect(200);

    expect(prisma.orderAuditLog.create).toHaveBeenCalledWith({
      data: {
        orderId: 1,
        adminUserId: 2,
        changedFields: ['status'],
        oldValues: { status: 'PENDING' },
        newValues: { status: 'CONFIRMED' },
        note: null
      }
    });
  });

  it('should create audit logs for item price and quantity updates', async () => {
    const mockOrder = {
      id: 1,
      userId: 5,
      status: 'PENDING',
      note: null,
      totalFinal: 100000,
      adminPriceAdjusted: false,
      orderItems: [{ id: 10, quantity: 1, priceFinal: 100000, totalFinal: 100000 }]
    };

    prisma.order.findUnique.mockResolvedValue(mockOrder);
    prisma.order.update.mockResolvedValue(mockOrder);

    await request(app)
      .put('/orders/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        items: [{ id: 10, quantity: 2, priceFinal: 120000 }]
      })
      .expect(200);

    expect(prisma.orderAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          changedFields: expect.arrayContaining(['items', 'totalFinal', 'adminPriceAdjusted']),
          oldValues: expect.objectContaining({
            items: [{ id: 10, quantity: 1, priceFinal: 100000 }]
          }),
          newValues: expect.objectContaining({
            items: [{ id: 10, quantity: 2, priceFinal: 120000 }]
          })
        })
      })
    );
  });

  it('should NOT create an OrderAuditLog record when update results in no changes', async () => {
    const mockOrder = {
      id: 1,
      userId: 5,
      status: 'CONFIRMED',
      note: 'Done',
      totalFinal: 100000,
      adminPriceAdjusted: false,
      orderItems: []
    };

    prisma.order.findUnique.mockResolvedValue(mockOrder);
    prisma.order.update.mockResolvedValue(mockOrder);

    await request(app)
      .put('/orders/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'CONFIRMED', note: 'Done' })
      .expect(200);

    expect(prisma.orderAuditLog.create).not.toHaveBeenCalled();
  });

  it('should fail order update if audit logging fails (transaction rollback)', async () => {
    const mockOrder = {
      id: 1,
      userId: 5,
      status: 'PENDING',
      note: null,
      totalFinal: 100000,
      adminPriceAdjusted: false,
      orderItems: []
    };

    prisma.order.findUnique.mockResolvedValue(mockOrder);
    prisma.orderAuditLog.create.mockRejectedValue(new Error('DB Log Fail'));

    await request(app)
      .put('/orders/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'CONFIRMED' })
      .expect(500);
  });
});
