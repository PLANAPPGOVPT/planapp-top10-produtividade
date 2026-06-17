import postgres from 'postgres'

let _sql: ReturnType<typeof postgres> | null = null

export function getDb() {
  if (_sql) return _sql
  const url = process.env.SUPPORT_SCHEMAS_URL || process.env.DATABASE_URL
  if (!url) {
    throw new Error('Missing SUPPORT_SCHEMAS_URL environment variable')
  }
  _sql = postgres(url, {
    prepare: false,
    ssl: { rejectUnauthorized: false },
  })
  return _sql
}
