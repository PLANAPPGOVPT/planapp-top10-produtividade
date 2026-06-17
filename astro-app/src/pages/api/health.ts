import type { APIRoute } from 'astro'
import sql from '../../lib/db'

export const GET: APIRoute = async () => {
  try {
    await sql`SELECT 1`
    return new Response(
      JSON.stringify({ status: 'ok', db: 'connected' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ status: 'error', db: 'disconnected', message: String(err) }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
