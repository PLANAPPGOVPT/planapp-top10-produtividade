import type { APIRoute } from 'astro'
import sql from '../../lib/db'

export const GET: APIRoute = async () => {
  const dimensoes = await sql`
    SELECT d.id, d.titulo,
      json_agg(
        json_build_object('id', m.id, 'titulo', m.titulo, 'descricao', m.descricao)
        ORDER BY m.id
      ) AS medidas
    FROM "projeto-produtividade-topten".dimensoes d
    JOIN "projeto-produtividade-topten".medidas m ON m.dimensao_id = d.id
    GROUP BY d.id, d.titulo
    ORDER BY d.id
  `

  return new Response(JSON.stringify(dimensoes), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
