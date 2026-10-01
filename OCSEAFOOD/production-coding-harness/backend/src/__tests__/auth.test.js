const request = require('supertest');
const { signToken } = require('../utils/jwt');
const app = require('../app');

describe('JWT Authentication Middleware', () => {
  it('should reject request without Authorization header with 401', async () => {
    const res = await request(app)
      .get('/test-auth')
      .expect('Content-Type', /json/)
      .expect(401);

    expect(res.body.error).toBeDefined();
    expect(res.body.error.status).toBe(401);
    expect(res.body.error.message).toMatch(/Missing or invalid token/);
  });

  it('should reject request with malformed token prefix with 401', async () => {
    const res = await request(app)
      .get('/test-auth')
      .set('Authorization', 'Basic user:pass')
      .expect(401);

    expect(res.body.error.status).toBe(401);
  });

  it('should reject request with forged signature with 401', async () => {
    const res = await request(app)
      .get('/test-auth')
      .set('Authorization', 'Bearer invalidtokenhere')
      .expect(401);

    expect(res.body.error.status).toBe(401);
  });

  it('should allow request with valid token and return user details with 200', async () => {
    const userPayload = { id: 1, email: 'customer@example.com', role: 'CUSTOMER' };
    const token = signToken(userPayload);

    const res = await request(app)
      .get('/test-auth')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.user).toBeDefined();
    expect(res.body.user.id).toBe(userPayload.id);
    expect(res.body.user.email).toBe(userPayload.email);
    expect(res.body.user.role).toBe(userPayload.role);
  });

  it('should allow a request authenticated by the HttpOnly session cookie', async () => {
    const token = signToken({ id: 2, email: 'cookie@example.com', role: 'CUSTOMER' });

    const res = await request(app)
      .get('/test-auth')
      .set('Cookie', `ocseafood_session=${token}`)
      .expect(200);

    expect(res.body.user.email).toBe('cookie@example.com');
  });

  it('should reject an expired session cookie', async () => {
    const token = signToken({ id: 2, email: 'expired@example.com', role: 'CUSTOMER' }, '-1s');

    await request(app)
      .get('/test-auth')
      .set('Cookie', `ocseafood_session=${token}`)
      .expect(401);
  });
});
