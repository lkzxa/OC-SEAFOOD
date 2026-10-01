const request = require('supertest');
const path = require('path');

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
    const env = require('../config/env');
    const originalNodeEnv = env.NODE_ENV;
    const originalMediaRoot = env.MEDIA_ROOT;
    const originalCorsOrigin = env.CORS_ORIGIN;
    env.NODE_ENV = 'production';
    env.MEDIA_ROOT = path.resolve(__dirname, '../../uploads');
    env.CORS_ORIGIN = 'https://ocseafood.test';

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
    env.NODE_ENV = originalNodeEnv;
    env.MEDIA_ROOT = originalMediaRoot;
    env.CORS_ORIGIN = originalCorsOrigin;
  });

  it('should return JSON for an unmatched route', async () => {
    const app = require('../app');
    const res = await request(app)
      .get('/route-that-does-not-exist')
      .expect('Content-Type', /json/)
      .expect(404);

    expect(res.body).toEqual({
      error: {
        message: 'Resource not found',
        status: 404
      }
    });
  });

  it('should sanitize a production 404 raised by static media', async () => {
    const env = require('../config/env');
    const originalNodeEnv = env.NODE_ENV;
    const originalMediaRoot = env.MEDIA_ROOT;
    const originalCorsOrigin = env.CORS_ORIGIN;
    env.NODE_ENV = 'production';
    env.MEDIA_ROOT = path.resolve(__dirname, '../../uploads');
    env.CORS_ORIGIN = 'https://ocseafood.test';

    const app = require('../app');
    const res = await request(app)
      .get('/uploads/missing-task-0057-image.png')
      .expect('Content-Type', /json/)
      .expect(404);

    expect(res.body.error).toEqual({
      message: 'Resource not found',
      status: 404
    });
    expect(JSON.stringify(res.body)).not.toMatch(/[A-Za-z]:\\\\/);
    expect(res.body.error.stack).toBeUndefined();

    env.NODE_ENV = originalNodeEnv;
    env.MEDIA_ROOT = originalMediaRoot;
    env.CORS_ORIGIN = originalCorsOrigin;
  });
});
