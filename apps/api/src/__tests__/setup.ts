/**
 * E2E test global setup file
 * Executed before all tests run
 */

declare global {

  var e2ePrefix: string
}

beforeAll(() => {
  const required = ['DATABASE_URL', 'JWT_SECRET']
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`E2E test requires environment variable: ${key}`)
    }
  }

  // Generate a timestamp-based prefix for email namespace isolation across E2E suites
  globalThis.e2ePrefix = `e2e-${Date.now()}`
})
