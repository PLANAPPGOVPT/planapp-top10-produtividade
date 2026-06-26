import type { APIRoute } from 'astro'

export const POST: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      error: 'A recolha de dados terminou no dia 25 de junho de 2026.',
    }),
    {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
