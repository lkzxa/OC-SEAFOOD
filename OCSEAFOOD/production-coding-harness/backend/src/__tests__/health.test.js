const request = require('supertest');
const app = require('../app');

describe('GET /health', () => {
  it('should return 200 OK and status ok json', async () => {
    const res = await request(app)
      .get('/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toEqual({ status: 'ok' });
  });
});
