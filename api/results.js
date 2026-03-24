export const config = { runtime: 'edge' };

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

export default async function handler(req) {
  if (req.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const res = await fetch(`${SUPABASE_URL}/rest/v1/resultado?select=candidato_id,candidato_nome,votos`, {
    headers: {
      'apikey':        SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });

  if (!res.ok) return json({ error: 'Database error' }, 502);

  const rows = await res.json();

  // Monta mapa { candidateId: { name, count } }
  const votes = {};
  rows.forEach(r => {
    votes[r.candidato_id] = { name: r.candidato_nome, count: parseInt(r.votos, 10) };
  });

  const total = rows.reduce((a, r) => a + parseInt(r.votos, 10), 0);

  return new Response(JSON.stringify({ votes, total }), {
    status: 200,
    headers: {
      'Content-Type':  'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 's-maxage=10, stale-while-revalidate=30'
    }
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
