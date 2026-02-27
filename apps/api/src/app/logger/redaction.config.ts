/**
 * Sensitive field redaction configuration
 *
 * Defines field paths that should be redacted in log output.
 * Supports wildcard * for matching nested fields.
 */
export const redactPaths = [
  // Sensitive fields in request headers
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-api-key"]',
  'req.headers["x-auth-token"]',

  // Generic sensitive fields (supports any nesting depth)
  '*.password',
  '*.confirmPassword',
  '*.oldPassword',
  '*.newPassword',
  '*.token',
  '*.accessToken',
  '*.refreshToken',
  '*.secret',
  '*.apiKey',
  '*.privateKey',
  '*.creditCard',
  '*.cardNumber',
  '*.cvv',
  '*.ssn',

  // Sensitive fields in request body
  'req.body.password',
  'req.body.confirmPassword',
  'req.body.token',
  'req.body.secret',

  // Sensitive fields in response body
  'res.body.token',
  'res.body.accessToken',
  'res.body.refreshToken',
]

/**
 * Replacement text for redacted values
 */
export const redactCensor = '[REDACTED]'
