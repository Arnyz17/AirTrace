/**
 * AppError.js
 *
 * Custom application error class.
 *
 * Controllers and services throw AppError instead of generic Error so that
 * the centralized error handler can produce a consistent JSON response with
 * a machine-readable code, human-readable message, and HTTP status.
 *
 * Usage:
 *   throw new AppError('INVALID_DATE_FORMAT', 400, 'date must be YYYY-MM-DD');
 */

'use strict';

class AppError extends Error {
  /**
   * @param {string} code      - Machine-readable error code (from errorCodes.js).
   * @param {number} status    - HTTP status code (400, 404, 500, …).
   * @param {string} message   - Human-readable description.
   */
  constructor(code, status, message) {
    super(message);
    this.name    = 'AppError';
    this.code    = code;
    this.status  = status;
    this.message = message;
  }
}

module.exports = { AppError };
