import * as schema from '@workspace/database'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import type { DrizzleModuleOptions } from './db.port'

/**
 * Creates a Drizzle database instance.
 *
 * Uses the node-postgres connection pool for connection management.
 * Uses the Drizzle relations syntax to support relational queries.
 */
export function createDrizzleInstance(options: DrizzleModuleOptions) {
  const pool = new Pool({
    connectionString: options.connectionString,
    max: options.pool?.max ?? 10,
    min: options.pool?.min ?? 2,
    idleTimeoutMillis: options.pool?.idleTimeoutMillis ?? 30_000,
    connectionTimeoutMillis: options.pool?.connectionTimeoutMillis ?? 5000,
  })

  return drizzle({ client: pool, schema })
}
