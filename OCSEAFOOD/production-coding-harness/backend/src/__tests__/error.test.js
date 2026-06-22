const request = require('supertest');

describe('Centralized Error Handler', () => {
  beforeEach(() => {
    // Clear node module cache to allow environment reloading
    jest.resetModules();
  });

  it('should return formatted JSON error with stack trace in non-production mode', async () => {
    const app = require('../app');
    const res = await request(app)
      .get('/test-error')
      .expect('Content-Type', /json/)
      .expect(500);

    expect(res.body.error).toBeDefined();
    expect(res.body.error.status).toBe(500);
    expect(res.body.error.message).toBe('This is a test server error');
    expect(res.body.error.stack).toBeDefined();
  });

  it('should return formatted JSON error without stack trace in production mode', async () => {
    // Override environment
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'productionsecret';

    const app = require('../app');
    const res = await request(app)
      .get('/test-error')
      .expect('Content-Type', /json/)
      .expect(500);

    expect(res.body.error).toBeDefined();
    expect(res.body.error.status).toBe(500);
    expect(res.body.error.message).toBe('Internal Server Error');
    expect(res.body.error.stack).toBeUndefined();

    // Clean up
    delete process.env.NODE_ENV;
    delete process.env.JWT_SECRET;
  });
});
