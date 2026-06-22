const request = require('supertest');
const app = require('../app');
const prisma = require('../config/prisma');

// Mock Prisma client singleton
jest.mock('../config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
  }
}));

describe('OAuth 2.0 Admin Authentication API', () => {
  let originalFetch;

  beforeEach(() => {
    jest.clearAllMocks();
    if (global.fetch) {
      originalFetch = global.fetch;
    }
  });

  afterEach(() => {
    if (originalFetch) {
      global.fetch = originalFetch;
    }
  });

  it('should reject requests without authorization code', async () => {
    const res = await request(app)
      .post('/auth/google')
      .send({})
      .expect(400);

    expect(res.body.error.message).toBe('Authorization code is required');
  });

  it('should authenticate successfully using development mock code', async () => {
    // Mock user search in Prisma to return an ADMIN
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'admin@ocseafood.vn',
      name: 'Admin User',
      role: 'ADMIN',
      password: 'hashedpassword'
    });

    const res = await request(app)
      .post('/auth/google')
      .send({ code: 'mock_google_admin_code' })
      .expect(200);

    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('admin@ocseafood.vn');
    expect(res.body.user.role).toBe('ADMIN');
    expect(res.body.user.password).toBeUndefined();
  });

  it('should reject non-admin users even with valid oauth mock code', async () => {
    // Mock user search to return a CUSTOMER
    prisma.user.findUnique.mockResolvedValue({
      id: 2,
      email: 'customer@example.com',
      name: 'Customer User',
      role: 'CUSTOMER',
      password: 'hashedpassword'
    });

    const res = await request(app)
      .post('/auth/google')
      .send({ code: 'mock_google_admin_code' })
      .expect(403);

    expect(res.body.error.message).toBe('Tài khoản Google này không có quyền truy cập Admin.');
  });
});
