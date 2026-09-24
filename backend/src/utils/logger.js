/**
 * Centralized Application Logger
 */
const getTimestamp = () => new Date().toISOString();

export const logger = {
  info: (message, meta = '') => {
    console.log(`[${getTimestamp()}] [INFO]  ${message}`, meta ? meta : '');
  },
  warn: (message, meta = '') => {
    console.warn(`[${getTimestamp()}] [WARN]  ${message}`, meta ? meta : '');
  },
  error: (message, meta = '') => {
    console.error(`[${getTimestamp()}] [ERROR] ${message}`, meta ? meta : '');
  },
  debug: (message, meta = '') => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${getTimestamp()}] [DEBUG] ${message}`, meta ? meta : '');
    }
  }
};

export default logger;
