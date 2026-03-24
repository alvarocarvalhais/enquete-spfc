export const config = { runtime: 'edge' };

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const ALLOWED_IDS  = ['ceni', 'dorival', 'gallardo', 'vojvoda', 'roger', 'outro'];

export default async function handler(req) {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let body;
  try { body = await req.json(); }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  const { candidateId, candidateName, nome, email, cpf, nasc } = body;

  if (!candidateId || !ALLOWED_IDS.includes(candidateId))
    return json({ error: 'Invalid candidate' }, 400);

  if (!nome || !email || !cpf || !nasc || !candidateName)
    return json({ error: 'Missing fields' }, 400);

  const res = await fetch(`${SUPABASE_URL}/rest/v1/votos`, {
    method: 'POST',
    headers: {
      'apikey':        SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type':  'application/json',
      'Prefer':        'return=minimal'
    },
    body: JSON.stringify({
      nome, email, cpf, nasc,
      candidato_id:   candidateId,
      candidato_nome: candidateName
    })
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Supabase error:', err);
    return json({ error: 'Database error' }, 502);
  }

  return json({ ok: true }, 201);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
