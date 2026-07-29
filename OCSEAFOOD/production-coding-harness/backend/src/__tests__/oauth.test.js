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

});
