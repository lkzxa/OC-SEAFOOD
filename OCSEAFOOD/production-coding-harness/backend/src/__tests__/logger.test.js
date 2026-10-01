const env = require('../config/env');
const logger = require('../utils/logger');
const express = require('express');
const request = require('supertest');
const requestLogger = require('../middleware/requestLogger');

describe('production logger', () => {
  let originalNodeEnv;

  beforeEach(() => {
    originalNodeEnv = env.NODE_ENV;
    env.NODE_ENV = 'production';
  });

  afterEach(() => {
    env.NODE_ENV = originalNodeEnv;
    jest.restoreAllMocks();
  });

  it('emits JSON and redacts credentials and connection URLs', () => {
    const output = jest.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('operation_failed', {
      authorization: 'Bearer top-secret-token',
      SMTP_PASS: 'mail-secret',
      error: new Error('Cannot connect to postgresql://user:db-password@db.internal/ocseafood'),
    });

    const parsed = JSON.parse(output.mock.calls[0][0]);
    expect(parsed.event).toBe('operation_failed');
    expect(parsed.authorization).toBe('[REDACTED]');
    expect(parsed.SMTP_PASS).toBe('[REDACTED]');
    expect(output.mock.calls[0][0]).not.toContain('top-secret-token');
    expect(output.mock.calls[0][0]).not.toContain('mail-secret');
    expect(output.mock.calls[0][0]).not.toContain('db-password');
  });

  it('logs request metadata without query parameters or request bodies', async () => {
    const output = jest.spyOn(console, 'log').mockImplementation(() => {});
    const app = express();
    app.use(express.json());
    app.use(requestLogger);
    app.post('/operation', (req, res) => res.status(201).json({ ok: true }));

    await request(app)
      .post('/operation?token=url-secret')
      .set('Authorization', 'Bearer header-secret')
      .send({ password: 'body-secret' })
      .expect(201);

    const parsed = JSON.parse(output.mock.calls[0][0]);
    expect(parsed).toEqual(expect.objectContaining({ event: 'http_request_completed', method: 'POST', path: '/operation', statusCode: 201 }));
    expect(output.mock.calls[0][0]).not.toContain('url-secret');
    expect(output.mock.calls[0][0]).not.toContain('header-secret');
    expect(output.mock.calls[0][0]).not.toContain('body-secret');
  });
});
