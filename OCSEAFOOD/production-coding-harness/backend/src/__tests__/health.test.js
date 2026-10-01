const request = require('supertest');
const prisma = require('../config/prisma');
const env = require('../config/env');
const app = require('../app');

jest.mock('../config/prisma', () => ({
  $queryRawUnsafe: jest.fn(),
}));

describe('health endpoints', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns Node liveness without querying PostgreSQL', async () => {
    const response = await request(app).get('/health/live').expect(200);
    expect(response.body).toEqual({ status: 'ok' });
    expect(prisma.$queryRawUnsafe).not.toHaveBeenCalled();
  });

  it.each(['/health', '/health/ready'])('returns readiness when PostgreSQL responds for %s', async (url) => {
    prisma.$queryRawUnsafe.mockResolvedValue([{ '?column?': 1 }]);
    const response = await request(app).get(url).expect(200);
    expect(response.body).toEqual({ status: 'ok', checks: { node: 'ok', database: 'ok' } });
  });

  it('returns a generic 503 when PostgreSQL is unavailable', async () => {
    prisma.$queryRawUnsafe.mockRejectedValue(new Error('postgresql://user:secret@db.internal/ocseafood refused'));
    const response = await request(app).get('/health/ready').expect(503);
    expect(response.body).toEqual({ status: 'unavailable', checks: { node: 'ok', database: 'unavailable' } });
    expect(JSON.stringify(response.body)).not.toContain('secret');
    expect(JSON.stringify(response.body)).not.toContain('db.internal');
  });

  it('bounds a stalled PostgreSQL readiness check', async () => {
    const originalTimeout = env.HEALTHCHECK_TIMEOUT_MS;
    env.HEALTHCHECK_TIMEOUT_MS = 10;
    prisma.$queryRawUnsafe.mockReturnValue(new Promise(() => {}));
    const response = await request(app).get('/health').expect(503);
    env.HEALTHCHECK_TIMEOUT_MS = originalTimeout;
    expect(response.body.checks.database).toBe('unavailable');
  });
});
