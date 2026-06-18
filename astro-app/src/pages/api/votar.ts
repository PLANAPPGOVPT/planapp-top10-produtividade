import type { APIRoute } from 'astro'
import { getDb } from '../../lib/db'

export const POST: APIRoute = async ({ request }) => {
  const sql = getDb()
  const { sessao_id, medidas, grupo } = await request.json()

  if (!sessao_id || !Array.isArray(medidas) || medidas.length !== 10) {
    return new Response(
      JSON.stringify({ error: 'session_id e array de 10 medidas obrigatórios' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  await sql`
    INSERT INTO "projeto-produtividade-topten".votos (sessao_id, medida_id, ordem_preferencia, grupo)
    SELECT ${sessao_id}, unnest(${medidas}::text[]), generate_series(1, 10), ${grupo ?? null}::text
  `

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
