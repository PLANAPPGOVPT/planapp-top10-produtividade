import postgres from 'postgres'

const connectionString = import.meta.env.SUPPORT_SCHEMAS_URL
if (!connectionString) {
  throw new Error('Missing SUPPORT_SCHEMAS_URL environment variable')
}

const sql = postgres(connectionString, {
  prepare: false,
  ssl: { rejectUnauthorized: false },
})

export default sql
