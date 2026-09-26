/**
 * responseHelpers.js
 *
 * Standard JSON response builders.
 *
 * All API responses follow one of two shapes:
 *
 *   Success:
 *   { "success": true, "data": { ... } }
 *
 *   Error:
 *   {
 *     "success": false,
 *     "error": {
 *       "code":    "ERROR_CODE",
 *       "message": "Human-readable description.",
 *       "status":  400
 *     }
 *   }
 *
 * The `code` field lets the frontend switch on machine-readable codes rather
 * than parsing human-readable message strings.
 */

'use strict';

const { ERROR_CODES } = require('../errors/errorCodes');

/**
 * Send a successful JSON response.
 *
 * @param {object} res        - Express Response object.
 * @param {any}    data       - Response payload.
 * @param {number} [status=200] - HTTP status code.
 */
function sendSuccess(res, data, status = 200) {
  res.status(status).json({ success: true, data });
}

/**
 * Send a structured JSON error response.
 *
 * Internal stack traces are NEVER included in the response body.
 *
 * @param {object} res     - Express Response object.
 * @param {number} status  - HTTP status code (400, 404, 500, …).
 * @param {string} message - Human-readable description.
 * @param {string} [code]  - Machine-readable error code from errorCodes.js.
 */
function sendError(res, status, message, code = null) {
  const resolvedCode = code || defaultCodeForStatus(status);
  res.status(status).json({
    success: false,
    error: {
      code:    resolvedCode,
      message,
      status,
    },
  });
}

/**
 * Map HTTP status codes to default error codes when no explicit code is given.
 *
 * @param {number} status
 * @returns {string}
 */
function defaultCodeForStatus(status) {
  const map = {
    400: ERROR_CODES.VALIDATION_ERROR,
    404: ERROR_CODES.RESOURCE_NOT_FOUND,
    500: ERROR_CODES.INTERNAL_ERROR,
  };
  return map[status] || ERROR_CODES.INTERNAL_ERROR;
}

module.exports = { sendSuccess, sendError };
