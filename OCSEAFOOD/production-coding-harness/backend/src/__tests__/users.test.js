const request = require('supertest');
const app = require('../app');
const prisma = require('../config/prisma');
const { signToken } = require('../utils/jwt');

jest.mock('../config/prisma', () => {
  return {
    user: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
});

describe('User Management API - /users', () => {
  let adminToken;
  let customerToken;
  const adminUser = { id: 1, email: 'admin@example.com', role: 'ADMIN' };
  const customerUser = { id: 5, email: 'customer@example.com', role: 'CUSTOMER' };

  beforeAll(() => {
    adminToken = signToken(adminUser);
    customerToken = signToken(customerUser);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Security & Access Control', () => {
    it('should reject unauthenticated request with 401', async () => {
      await request(app).get('/users').expect(401);
      await request(app).post('/users').send({}).expect(401);
      await request(app).put('/users/2').send({}).expect(401);
      await request(app).delete('/users/2').expect(401);
    });

    it('should reject CUSTOMER role request with 403', async () => {
      await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({})
        .expect(403);
    });
  });

  describe('GET /users', () => {
    it('should successfully list users as ADMIN', async () => {
      prisma.user.count.mockResolvedValue(2);
      prisma.user.findMany.mockResolvedValue([
        { id: 1, email: 'admin@example.com', name: 'Admin', role: 'ADMIN', createdAt: new Date() },
        { id: 5, email: 'customer@example.com', name: 'Customer', role: 'CUSTOMER', createdAt: new Date() },
      ]);

      const res = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination).toEqual({
        page: 1,
        pageSize: 100,
        totalItems: 2,
        totalPages: 1,
      });
      expect(prisma.user.findMany).toHaveBeenCalled();
    });
  });

  describe('POST /users', () => {
    it('should successfully create a new user as ADMIN', async () => {
      const payload = {
        email: 'staff@example.com',
        name: 'Staff Member',
        password: 'password123',
        role: 'ADMIN',
      };

      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 10,
        email: 'staff@example.com',
        name: 'Staff Member',
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload)
        .expect(201);

      expect(res.body.email).toBe('staff@example.com');
      expect(res.body.role).toBe('ADMIN');
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should return 400 if email is already registered', async () => {
      const payload = {
        email: 'admin@example.com',
        name: 'Admin Duplicate',
        password: 'password123',
        role: 'ADMIN',
      };

      prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'admin@example.com' });

      const res = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload)
        .expect(400);

      expect(res.body.error.message).toBe('Email is already registered');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('PUT /users/:id', () => {
    it('should successfully update user details', async () => {
      const payload = {
        name: 'Updated Name',
        role: 'CUSTOMER',
      };

      prisma.user.findUnique.mockResolvedValue({ id: 2, email: 'user2@example.com' });
      prisma.user.update.mockResolvedValue({
        id: 2,
        email: 'user2@example.com',
        name: 'Updated Name',
        role: 'CUSTOMER',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .put('/users/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload)
        .expect(200);

      expect(res.body.name).toBe('Updated Name');
      expect(res.body.role).toBe('CUSTOMER');
      expect(prisma.user.update).toHaveBeenCalled();
    });
  });

  describe('DELETE /users/:id', () => {
    it('should successfully delete another user', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 2, email: 'user2@example.com' });
      prisma.user.delete.mockResolvedValue({ id: 2 });

      const res = await request(app)
        .delete('/users/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.message).toBe('User deleted successfully');
      expect(prisma.user.delete).toHaveBeenCalled();
    });

    it('should prevent self-deletion', async () => {
      const res = await request(app)
        .delete('/users/1') // adminUser has id: 1
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(res.body.error.message).toBe('You cannot delete your own account');
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });
  });
});
