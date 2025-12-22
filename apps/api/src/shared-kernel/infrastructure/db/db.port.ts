import type { InjectionToken, ModuleMetadata } from '@nestjs/common'
import type * as schema from '@workspace/database'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'

// DIP: Abstract token for Drizzle instance
export const DB_TOKEN = Symbol('DB_TOKEN')

// Strongly-typed Drizzle instance - using v1 schema types
export type DrizzleDb = NodePgDatabase<typeof schema>

// Schema type export
export type Schema = typeof schema

// Connection pool configuration options
export interface DrizzlePoolOptions {
  max?: number
  min?: number
  idleTimeoutMillis?: number
  connectionTimeoutMillis?: number
}

// DrizzleModule configuration options
export interface DrizzleModuleOptions {
  connectionString: string
  pool?: DrizzlePoolOptions
}

// forRootAsync async configuration options
export interface DrizzleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: InjectionToken[]
  useFactory: (
    ...args: unknown[]
  ) => DrizzleModuleOptions | Promise<DrizzleModuleOptions>
}
