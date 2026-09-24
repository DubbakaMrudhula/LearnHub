import app from './app.js';
import env from './config/env.js';
import { connectDB } from './config/db.js';
import logger from './utils/logger.js';

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Start HTTP Server
    const server = app.listen(env.PORT, () => {
      logger.info(`================================================`);
      logger.info(` LearnHub Server running in [${env.NODE_ENV}] mode`);
      logger.info(` Listening on: http://localhost:${env.PORT}`);
      logger.info(` Health check: http://localhost:${env.PORT}/api/health`);
      logger.info(`================================================`);
    });

    // Graceful Shutdown
    const handleShutdown = (signal) => {
      logger.info(`Received ${signal}. Gracefully terminating server...`);
      server.close(() => {
        logger.info('HTTP Server closed.');
        process.exit(0);
      });

      // Force close if graceful termination hangs
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Promise Rejection:', reason);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

  } catch (err) {
    logger.error(`Fatal Server Initialization Error: ${err.message}`);
    process.exit(1);
  }
};

startServer();
