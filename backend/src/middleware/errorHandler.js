/**
 * errorHandler.js
 *
 * Centralized Express error-handling middleware.
 *
 * Must be registered as the LAST middleware in app.js (after all routes) so
 * that errors thrown anywhere in the request lifecycle are caught here.
 *
 * Distinguishes between:
 *   - AppError   → operational error with known code; serialize as-is.
 *   - SyntaxError (JSON parse) → return structured 400 response.
 *   - Unknown error → log internally, return generic 500 (never expose
 *                     stack traces or internal details to API consumers).
 */

'use strict';

const { AppError }    = require('../errors/AppError');
const { ERROR_CODES } = require('../errors/errorCodes');

/**
 * Express error handler.  Must have 4 parameters.
 *
 * @param {Error}   err
 * @param {object}  req
 * @param {object}  res
 * @param {Function} next
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // ── Known application error ───────────────────────────────────────────────
  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      error: {
        code:    err.code,
        message: err.message,
        status:  err.status,
      },
    });
  }

  // ── JSON body parse error (Express built-in) ──────────────────────────────
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code:    ERROR_CODES.VALIDATION_ERROR,
        message: 'Request body contains malformed JSON.',
        status:  400,
      },
    });
  }

  // ── Unknown / unexpected error ────────────────────────────────────────────
  // Log internally for debugging but NEVER expose details to API consumers.
  console.error('[ERROR] Unhandled error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  return res.status(500).json({
    success: false,
    error: {
      code:    ERROR_CODES.INTERNAL_ERROR,
      message: 'An unexpected error occurred.  Please try again.',
      status:  500,
    },
  });
}

module.exports = { errorHandler };
