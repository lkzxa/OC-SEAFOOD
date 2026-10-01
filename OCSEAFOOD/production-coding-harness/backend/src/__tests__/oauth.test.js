const request = require('supertest');
const app = require('../app');
const prisma = require('../config/prisma');
const env = require('../config/env');

jest.mock('../middleware/rateLimiter', () => ({
  authRateLimiter: (req, res, next) => next(),
  testAuthRateLimiter: (req, res, next) => next(),
  checkoutRateLimiter: (req, res, next) => next(),
  testCheckoutRateLimiter: (req, res, next) => next(),
  recruitmentRateLimiter: (req, res, next) => next(),
  testRecruitmentRateLimiter: (req, res, next) => next(),
}));

jest.mock('../config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  }
}));

describe('OAuth 2.0 Authentication API', () => {
  const originalNodeEnv = env.NODE_ENV;
  const originalClientId = env.GOOGLE_CLIENT_ID;
  const originalClientSecret = env.GOOGLE_CLIENT_SECRET;
  const originalCallback = env.GOOGLE_CALLBACK_URL;
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    env.NODE_ENV = 'test';
    env.GOOGLE_CLIENT_ID = 'test-client-id';
    env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    env.GOOGLE_CALLBACK_URL = 'http://localhost:3000/login';
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'google-access-token' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          sub: 'google-123',
          email: 'admin@example.com',
          email_verified: true,
          name: 'Admin',
          picture: 'https://example.com/avatar.jpg',
        }),
      });
  });

  afterAll(() => {
    env.NODE_ENV = originalNodeEnv;
    env.GOOGLE_CLIENT_ID = originalClientId;
    env.GOOGLE_CLIENT_SECRET = originalClientSecret;
    env.GOOGLE_CALLBACK_URL = originalCallback;
    global.fetch = originalFetch;
  });

  const issueState = async (nodeEnv = 'test') => {
    env.NODE_ENV = nodeEnv;
    const response = await request(app).post('/auth/google/state').expect(200);
    return {
      state: response.body.state,
      cookie: response.headers['set-cookie'][0].split(';')[0],
      fullCookie: response.headers['set-cookie'][0],
    };
  };

  it('should reject requests without authorization code', async () => {
    const res = await request(app)
      .post('/auth/google')
      .send({})
      .expect(400);

    expect(res.body.error.message).toBe('Authorization code is required');
  });

  it('should issue random, short-lived, HttpOnly OAuth state', async () => {
    const first = await issueState();
    const second = await issueState();

    expect(first.state).toHaveLength(43);
    expect(first.state).not.toBe(second.state);
    expect(first.fullCookie).toContain('ocseafood_oauth_state=');
    expect(first.fullCookie).toContain('HttpOnly');
    expect(first.fullCookie).toContain('Max-Age=600');
    expect(first.fullCookie).toContain('SameSite=Lax');
    expect(first.fullCookie).not.toContain('Secure');
  });

  it('should reject a mismatched state before contacting Google and clear it', async () => {
    const issued = await issueState();
    global.fetch.mockClear();

    const response = await request(app)
      .post('/auth/google')
      .set('Cookie', issued.cookie)
      .send({ code: 'code', state: 'wrong-state' })
      .expect(403);

    expect(response.body.error.message).toBe('OAuth state is missing or invalid');
    expect(response.headers['set-cookie'][0]).toContain('ocseafood_oauth_state=;');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should authenticate an existing Admin in production and set a Secure session cookie', async () => {
    const issued = await issueState('production');
    const admin = {
      id: 1,
      email: 'admin@example.com',
      name: 'Admin',
      role: 'ADMIN',
      googleId: null,
      avatar: null,
      password: 'secret-hash',
    };
    prisma.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(admin);
    prisma.user.update.mockResolvedValue({
      ...admin,
      googleId: 'google-123',
      avatar: 'https://example.com/avatar.jpg',
    });

    const response = await request(app)
      .post('/auth/google')
      .set('Cookie', issued.cookie)
      .send({ code: 'valid-code', state: issued.state })
      .expect(200);

    expect(response.body.token).toBeUndefined();
    expect(response.body.user.role).toBe('ADMIN');
    expect(response.body.user.password).toBeUndefined();
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: admin.id },
      data: expect.objectContaining({ googleId: 'google-123' }),
    }));
    const sessionCookie = response.headers['set-cookie'].find((cookie) =>
      cookie.startsWith('__Host-ocseafood_session=')
    );
    expect(sessionCookie).toContain('HttpOnly');
    expect(sessionCookie).toContain('Secure');
    expect(sessionCookie).toContain('SameSite=Lax');
  });

  it('should consume OAuth state once in the browser session', async () => {
    const agent = request.agent(app);
    const stateResponse = await agent.post('/auth/google/state').expect(200);
    const user = {
      id: 1,
      email: 'admin@example.com',
      name: 'Admin',
      role: 'ADMIN',
      googleId: 'google-123',
      avatar: 'https://example.com/avatar.jpg',
      password: null,
    };
    prisma.user.findUnique.mockResolvedValue(user);

    await agent
      .post('/auth/google')
      .send({ code: 'valid-code', state: stateResponse.body.state })
      .expect(200);

    global.fetch.mockClear();
    await agent
      .post('/auth/google')
      .send({ code: 'valid-code', state: stateResponse.body.state })
      .expect(403);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should authenticate an existing Customer Google identity in production', async () => {
    const issued = await issueState('production');
    const customer = {
      id: 2,
      email: 'customer@example.com',
      name: 'Customer',
      role: 'CUSTOMER',
      googleId: 'google-123',
      avatar: null,
      password: null,
    };
    prisma.user.findUnique.mockResolvedValue(customer);
    prisma.user.update.mockResolvedValue({
      ...customer,
      avatar: 'https://example.com/avatar.jpg',
    });

    const response = await request(app)
      .post('/auth/google')
      .set('Cookie', issued.cookie)
      .send({ code: 'valid-code', state: issued.state })
      .expect(200);

    expect(response.body.user.role).toBe('CUSTOMER');
    expect(response.body.user.password).toBeUndefined();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('should create a Customer for an unknown Google identity in production', async () => {
    const issued = await issueState('production');
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 3,
      email: 'admin@example.com',
      name: 'Admin',
      role: 'CUSTOMER',
      googleId: 'google-123',
      avatar: 'https://example.com/avatar.jpg',
      password: null,
    });

    const response = await request(app)
      .post('/auth/google')
      .set('Cookie', issued.cookie)
      .send({ code: 'valid-code', state: issued.state })
      .expect(200);

    expect(response.body.user.role).toBe('CUSTOMER');
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'admin@example.com',
        googleId: 'google-123',
        role: 'CUSTOMER',
      }),
    });
  });
});
