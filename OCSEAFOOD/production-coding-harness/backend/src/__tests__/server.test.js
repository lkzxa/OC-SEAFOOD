const { createShutdown, startServer } = require('../server');

function makeLogger() {
  return { info: jest.fn(), warn: jest.fn(), error: jest.fn(), fatal: jest.fn() };
}

function makeServer(events, closeCallback = true) {
  return {
    once: jest.fn(),
    close: jest.fn((callback) => {
      events.push('http-close');
      if (closeCallback) callback();
    }),
    closeAllConnections: jest.fn(() => events.push('http-force-close')),
  };
}

describe('backend server lifecycle', () => {
  const productionEnv = {
    NODE_ENV: 'production',
    PORT: 5000,
    CORS_ORIGIN: 'https://ocseafood.vn',
    SHUTDOWN_TIMEOUT_MS: 100,
  };

  it('connects PostgreSQL before listening and skips demo seeding in production', async () => {
    const events = [];
    const server = makeServer(events);
    const prisma = {
      $connect: jest.fn(async () => events.push('db-connect')),
      $disconnect: jest.fn(async () => events.push('db-disconnect')),
    };
    const seed = jest.fn(async () => events.push('seed'));
    const startWorker = jest.fn(() => events.push('worker-start'));
    const stopWorker = jest.fn(async () => events.push('worker-stop'));
    const runtime = await startServer({
      env: productionEnv,
      logger: makeLogger(),
      prisma,
      app: {},
      seed,
      startWorker,
      stopWorker,
      listen: jest.fn(async () => { events.push('listen'); return server; }),
      skipMediaValidation: true,
    });

    expect(events).toEqual(['db-connect', 'listen', 'worker-start']);
    expect(seed).not.toHaveBeenCalled();
    await runtime.shutdown('test');
    expect(events).toEqual(['db-connect', 'listen', 'worker-start', 'http-close', 'worker-stop', 'db-disconnect']);
  });

  it('keeps the port closed and marks startup failure when PostgreSQL is unavailable', async () => {
    const prisma = { $connect: jest.fn().mockRejectedValue(new Error('database down')), $disconnect: jest.fn().mockResolvedValue() };
    const listenFn = jest.fn();
    const startWorker = jest.fn();
    const logger = makeLogger();

    await expect(startServer({ env: productionEnv, logger, prisma, app: {}, listen: listenFn, startWorker, stopWorker: jest.fn(), seed: jest.fn(), skipMediaValidation: true })).rejects.toThrow('database down');
    expect(listenFn).not.toHaveBeenCalled();
    expect(startWorker).not.toHaveBeenCalled();
    expect(prisma.$disconnect).toHaveBeenCalled();
    expect(logger.fatal).toHaveBeenCalledWith('server_startup_failed', expect.any(Object));
  });

  it('rejects unsafe production CORS before connecting PostgreSQL', async () => {
    const prisma = { $connect: jest.fn(), $disconnect: jest.fn() };
    await expect(startServer({ env: { ...productionEnv, CORS_ORIGIN: '*' }, logger: makeLogger(), prisma, app: {}, skipMediaValidation: true })).rejects.toThrow(/cannot use wildcard/);
    expect(prisma.$connect).not.toHaveBeenCalled();
  });

  it('returns the same shutdown promise and force-closes on timeout', async () => {
    const events = [];
    const server = makeServer(events, false);
    const prisma = { $disconnect: jest.fn(async () => events.push('db-disconnect')) };
    const shutdown = createShutdown({ server, prisma, stopWorker: jest.fn(() => new Promise(() => {})), timeoutMs: 10, logger: makeLogger() });
    const first = shutdown('SIGTERM');
    const second = shutdown('SIGINT');
    expect(first).toBe(second);
    await expect(first).rejects.toThrow(/timed out/);
    expect(server.closeAllConnections).toHaveBeenCalled();
    expect(prisma.$disconnect).toHaveBeenCalled();
  });
});
