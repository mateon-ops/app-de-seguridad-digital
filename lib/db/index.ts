import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const globalForDb = globalThis as unknown as { pool?: Pool }

const connectionString = process.env.DATABASE_URL

export const pool = connectionString
  ? (globalForDb.pool ?? new Pool({
      connectionString,
      max: 5,
      connectionTimeoutMillis: 8_000,
      idleTimeoutMillis: 30_000,
      query_timeout: 8_000,
      statement_timeout: 8_000,
    }))
  : undefined

if (pool && process.env.NODE_ENV !== 'production') globalForDb.pool = pool

export const db = pool ? drizzle(pool, { schema }) : null
