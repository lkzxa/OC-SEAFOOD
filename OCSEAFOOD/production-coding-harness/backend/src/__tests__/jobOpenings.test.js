const request = require('supertest');
const app = require('../app');
const prisma = require('../config/prisma');
const { signToken } = require('../utils/jwt');

// Mock Prisma client singleton
jest.mock('../config/prisma', () => {
  const mockPrisma = {
    jobOpening: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return mockPrisma;
});

// Mock rate limiters to prevent 429 errors in tests
jest.mock('../middleware/rateLimiter', () => ({
  authRateLimiter: (req, res, next) => next(),
  checkoutRateLimiter: (req, res, next) => next(),
  testAuthRateLimiter: (req, res, next) => next(),
  testCheckoutRateLimiter: (req, res, next) => next(),
  recruitmentRateLimiter: (req, res, next) => next(),
  testRecruitmentRateLimiter: (req, res, next) => next(),
}));

describe('Job Openings API - /job-openings', () => {
  let adminToken;
  let customerToken;

  const validPayload = {
    title: 'Nhân viên Kho',
    quantity: 2,
    salary: '8.000.000 - 10.000.000 VND',
    location: 'TP. Hồ Chí Minh',
    description: 'Quản lý kho hàng hải sản.',
    requirements: ['Cẩn thận, trung thực', 'Có kinh nghiệm là lợi thế'],
    isVisible: true,
  };

  beforeAll(() => {
    adminToken = signToken({ id: 1, email: 'admin@ocseafood.vn', role: 'ADMIN' });
    customerToken = signToken({ id: 2, email: 'customer@example.com', role: 'CUSTOMER' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /job-openings - Public visible list', () => {
    it('should return only visible job openings with 200', async () => {
      const mockList = [{ id: 1, title: 'Nhân viên Kho', isVisible: true }];
      prisma.jobOpening.findMany.mockResolvedValue(mockList);

      const res = await request(app).get('/job-openings').expect(200);

      expect(res.body).toEqual(mockList);
      expect(prisma.jobOpening.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isVisible: true } })
      );
    });
  });

  describe('GET /job-openings/admin - Admin view list', () => {
    it('should block non-admins with 403', async () => {
      await request(app)
        .get('/job-openings/admin')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });

    it('should allow admins to retrieve visible and hidden job openings', async () => {
      const mockList = [
        { id: 1, title: 'Nhân viên Kho', isVisible: true },
        { id: 2, title: 'Vị trí đã đóng', isVisible: false },
      ];
      prisma.jobOpening.findMany.mockResolvedValue(mockList);

      const res = await request(app)
        .get('/job-openings/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toEqual(mockList);
    });
  });

  describe('POST /job-openings - Admin only create', () => {
    it('should block non-admins with 403', async () => {
      await request(app)
        .post('/job-openings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(validPayload)
        .expect(403);
    });

    it('should validate payload and return 400 on missing requirements', async () => {
      await request(app)
        .post('/job-openings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...validPayload, requirements: [] })
        .expect(400);
    });

    it('should create new job opening successfully as admin', async () => {
      prisma.jobOpening.create.mockResolvedValue({ id: 5, ...validPayload });

      const res = await request(app)
        .post('/job-openings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validPayload)
        .expect(201);

      expect(res.body.id).toBe(5);
      expect(prisma.jobOpening.create).toHaveBeenCalledWith({ data: validPayload });
    });
  });

  describe('PUT /job-openings/:id - Admin only update', () => {
    it('should return 404 if job opening does not exist', async () => {
      prisma.jobOpening.findUnique.mockResolvedValue(null);

      await request(app)
        .put('/job-openings/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validPayload)
        .expect(404);
    });

    it('should update job opening successfully as admin', async () => {
      prisma.jobOpening.findUnique.mockResolvedValue({ id: 5, ...validPayload });
      prisma.jobOpening.update.mockResolvedValue({ id: 5, ...validPayload, title: 'Nhân viên Kho (Cập nhật)' });

      const res = await request(app)
        .put('/job-openings/5')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...validPayload, title: 'Nhân viên Kho (Cập nhật)' })
        .expect(200);

      expect(res.body.title).toBe('Nhân viên Kho (Cập nhật)');
    });
  });

  describe('DELETE /job-openings/:id - Admin only delete', () => {
    it('should block non-admins with 403', async () => {
      await request(app)
        .delete('/job-openings/5')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });

    it('should return 404 if job opening does not exist', async () => {
      prisma.jobOpening.findUnique.mockResolvedValue(null);

      await request(app)
        .delete('/job-openings/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should delete job opening successfully as admin', async () => {
      prisma.jobOpening.findUnique.mockResolvedValue({ id: 5, ...validPayload });
      prisma.jobOpening.delete.mockResolvedValue({ id: 5 });

      await request(app)
        .delete('/job-openings/5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(prisma.jobOpening.delete).toHaveBeenCalledWith({ where: { id: 5 } });
    });
  });
});
