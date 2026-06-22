const request = require('supertest');
const app = require('../app');

describe('API Abuse Protection - Rate Limiting', () => {
  describe('POST /test-rate-limit-auth (Auth Limit)', () => {
    it('should allow up to 3 requests in a short window, then block with 429', async () => {
      // 1st request
      await request(app)
        .post('/test-rate-limit-auth')
        .expect(200);

      // 2nd request
      await request(app)
        .post('/test-rate-limit-auth')
        .expect(200);

      // 3rd request
      await request(app)
        .post('/test-rate-limit-auth')
        .expect(200);

      // 4th request (exceeds max: 3)
      const res = await request(app)
        .post('/test-rate-limit-auth')
        .expect(429);

      expect(res.body.error).toBeDefined();
      expect(res.body.error.status).toBe(429);
      expect(res.body.error.message).toBe('Too many requests, please try again later');
    });
  });

  describe('POST /test-rate-limit-checkout (Checkout Limit)', () => {
    it('should allow up to 3 requests in a short window, then block with 429', async () => {
      // 1st request
      await request(app)
        .post('/test-rate-limit-checkout')
        .expect(200);

      // 2nd request
      await request(app)
        .post('/test-rate-limit-checkout')
        .expect(200);

      // 3rd request
      await request(app)
        .post('/test-rate-limit-checkout')
        .expect(200);

      // 4th request (exceeds max: 3)
      const res = await request(app)
        .post('/test-rate-limit-checkout')
        .expect(429);

      expect(res.body.error).toBeDefined();
      expect(res.body.error.status).toBe(429);
      expect(res.body.error.message).toBe('Too many requests, please try again later');
    });
  });
});
