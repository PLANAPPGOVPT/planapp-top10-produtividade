import type { APIRoute } from 'astro'
import { getDb } from '../../../lib/db'

export const GET: APIRoute = async () => {
  try {
    const sql = getDb()
    const result = await sql`SELECT 1 AS db_check`
    return new Response(
      JSON.stringify({
        status: 'ok',
        db: 'connected',
        check: result[0]?.db_check === 1,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error'
    return new Response(
      JSON.stringify({
        status: 'error',
        db: 'disconnected',
        error: message,
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}