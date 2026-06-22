const request = require('supertest');
const app = require('../app');
const { signToken } = require('../utils/jwt');

describe('Role-Based Authorization Middleware', () => {
  describe('GET /test-admin (ADMIN only)', () => {
    it('should reject unauthenticated request with 401', async () => {
      const res = await request(app)
        .get('/test-admin')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(res.body.error).toBeDefined();
      expect(res.body.error.message).toMatch(/Missing or invalid token/);
    });

    it('should reject CUSTOMER user request with 403', async () => {
      const customerToken = signToken({ id: 10, email: 'customer@example.com', role: 'CUSTOMER' });

      const res = await request(app)
        .get('/test-admin')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect('Content-Type', /json/)
        .expect(403);

      expect(res.body.error).toBeDefined();
      expect(res.body.error.message).toBe('Forbidden: You do not have permission to access this resource');
    });

    it('should accept ADMIN user request with 200', async () => {
      const adminToken = signToken({ id: 1, email: 'admin@example.com', role: 'ADMIN' });

      const res = await request(app)
        .get('/test-admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.message).toBe('Admin access granted');
    });
  });

  describe('GET /test-customer (CUSTOMER or ADMIN)', () => {
    it('should reject unauthenticated request with 401', async () => {
      const res = await request(app)
        .get('/test-customer')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(res.body.error).toBeDefined();
    });

    it('should accept CUSTOMER user request with 200', async () => {
      const customerToken = signToken({ id: 10, email: 'customer@example.com', role: 'CUSTOMER' });

      const res = await request(app)
        .get('/test-customer')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.message).toBe('Customer access granted');
    });

    it('should accept ADMIN user request with 200', async () => {
      const adminToken = signToken({ id: 1, email: 'admin@example.com', role: 'ADMIN' });

      const res = await request(app)
        .get('/test-customer')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.message).toBe('Customer access granted');
    });
  });
});
