/**
 * Standardized API Response Utilities
 * Ensures consistent JSON structure across all API endpoints.
 */

/**
 * Send a successful JSON response
 * @param {import('express').Response} res
 * @param {string} message
 * @param {object|array|null} data
 * @param {number} statusCode
 */
export const successResponse = (res, message = 'Success', data = null, statusCode = 200) => {
  const payload = {
    success: true,
    message
  };

  if (data !== null && data !== undefined) {
    payload.data = data;
  }

  return res.status(statusCode).json(payload);
};

/**
 * Send an error JSON response
 * @param {import('express').Response} res
 * @param {string} message
 * @param {string|object|null} error
 * @param {number} statusCode
 */
export const errorResponse = (res, message = 'An error occurred', error = null, statusCode = 500) => {
  const payload = {
    success: false,
    message
  };

  if (error !== null && error !== undefined) {
    payload.error = error;
  }

  return res.status(statusCode).json(payload);
};

/**
 * Send a paginated JSON response
 * @param {import('express').Response} res
 * @param {string} message
 * @param {array} items
 * @param {number} page
 * @param {number} limit
 * @param {number} total
 * @param {number} statusCode
 */
export const paginatedResponse = (res, message = 'Success', items = [], page = 1, limit = 10, total = 0, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(total),
        totalPages: Math.ceil(total / limit) || 1,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  });
};
