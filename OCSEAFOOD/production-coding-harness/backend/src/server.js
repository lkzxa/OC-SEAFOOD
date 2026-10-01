const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

function listen(app, port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => resolve(server));
    server.once('error', reject);
  });
}

function closeHttpServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}

async function disconnectPrisma(prisma) {
  try {
    await prisma.$disconnect();
  } catch {
    // Shutdown must continue even if the database client is already disconnected.
  }
}

function createShutdown({ server, prisma, stopWorker, timeoutMs, logger }) {
  let shutdownPromise = null;

  return function shutdown(reason = 'manual') {
    if (shutdownPromise) return shutdownPromise;

    shutdownPromise = (async () => {
      logger.info('server_shutdown_started', { reason });
      const closePromise = closeHttpServer(server);
      const graceful = (async () => {
        await stopWorker();
        await closePromise;
        await disconnectPrisma(prisma);
      })();

      let timeoutId;
      const timeout = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Graceful shutdown timed out.')), timeoutMs);
      });

      try {
        await Promise.race([graceful, timeout]);
        logger.info('server_shutdown_completed', { reason });
      } catch (error) {
        server.closeAllConnections?.();
        await disconnectPrisma(prisma);
        logger.error('server_shutdown_failed', { reason, error });
        throw error;
      } finally {
        clearTimeout(timeoutId);
      }
    })();

    return shutdownPromise;
  };
}

async function startServer(overrides = {}) {
  const runtimeEnv = overrides.env || require('./config/env');
  const logger = overrides.logger || require('./utils/logger');
  const prisma = overrides.prisma || require('./config/prisma');
  const { getAllowedOrigins } = require('./config/cors');
  const { validateMediaConfiguration } = require('./config/media');
  const { seedCombos } = require('./config/seedCombos');
  const worker = require('./workers/notificationWorker');
  const startWorker = overrides.startWorker || worker.startNotificationWorker;
  const stopWorker = overrides.stopWorker || worker.stopNotificationWorker;
  const seed = overrides.seed || seedCombos;
  const listenFn = overrides.listen || listen;

  let server;
  try {
    getAllowedOrigins(runtimeEnv);
    if (!overrides.skipMediaValidation) validateMediaConfiguration();
    const app = overrides.app || require('./app');
    await prisma.$connect();
    logger.info('database_connected');

    if (runtimeEnv.NODE_ENV !== 'production') await seed();

    server = await listenFn(app, runtimeEnv.PORT);
    startWorker();
    logger.info('server_started', { port: runtimeEnv.PORT, environment: runtimeEnv.NODE_ENV });

    return {
      server,
      shutdown: createShutdown({ server, prisma, stopWorker, timeoutMs: runtimeEnv.SHUTDOWN_TIMEOUT_MS, logger }),
    };
  } catch (error) {
    if (server) {
      await closeHttpServer(server).catch(() => {});
      server.closeAllConnections?.();
    }
    await disconnectPrisma(prisma);
    logger.fatal('server_startup_failed', { error });
    throw error;
  }
}

function registerProcessHandlers(runtime, logger = require('./utils/logger')) {
  let requested = false;
  const terminate = async (reason, failure = false) => {
    if (requested) return;
    requested = true;
    try {
      await runtime.shutdown(reason);
      process.exitCode = failure ? 1 : 0;
    } catch {
      process.exitCode = 1;
    }
  };

  process.once('SIGTERM', () => void terminate('SIGTERM'));
  process.once('SIGINT', () => void terminate('SIGINT'));
  process.once('uncaughtException', (error) => {
    logger.fatal('uncaught_exception', { error });
    void terminate('uncaughtException', true);
  });
  process.once('unhandledRejection', (error) => {
    logger.fatal('unhandled_rejection', { error });
    void terminate('unhandledRejection', true);
  });
}

async function main() {
  let logger;
  try {
    logger = require('./utils/logger');
    const runtime = await startServer();
    registerProcessHandlers(runtime, logger);
  } catch (error) {
    if (!logger) {
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'fatal',
        event: 'server_startup_failed',
        error: { name: error.name, message: error.message, code: error.code },
      }));
    }
    process.exitCode = 1;
  }
}

if (require.main === module) void main();

module.exports = { closeHttpServer, createShutdown, disconnectPrisma, listen, main, registerProcessHandlers, startServer };
