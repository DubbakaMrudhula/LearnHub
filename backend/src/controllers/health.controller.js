import { successResponse } from '../utils/apiResponse.js';
import { getDBStatus } from '../config/db.js';
import env from '../config/env.js';

/**
 * @desc Get system health status
 * @route GET /api/health
 * @access Public
 */
export const getHealth = (req, res) => {
  const memoryUsage = process.memoryUsage();
  const formatMB = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

  const healthData = {
    service: 'LearnHub API Server',
    status: 'healthy',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(0)} seconds`,
    database: {
      status: getDBStatus(),
      client: 'MongoDB / Mongoose'
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        rss: formatMB(memoryUsage.rss),
        heapTotal: formatMB(memoryUsage.heapTotal),
        heapUsed: formatMB(memoryUsage.heapUsed)
      }
    }
  };

  return successResponse(res, 'LearnHub API is operational', healthData, 200);
};
