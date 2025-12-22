/**
 * Sensitive data redaction config
 * Defines field paths to redact in logs (supports wildcards)
 */
export const redactPaths = [
  // Sensitive request headers
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-api-key"]',
  'req.headers["x-auth-token"]',

  // Common sensitive fields (supports nested)
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

  // Request body
  'req.body.password',
  'req.body.confirmPassword',
  'req.body.token',
  'req.body.secret',

  // Response body
  'res.body.token',
  'res.body.accessToken',
  'res.body.refreshToken',
]

/**
 * Redaction replacement text
 */
export const redactCensor = '[REDACTED]'
