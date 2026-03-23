export const config = { runtime: 'edge' };

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

const ALLOWED_IDS = ['ceni', 'dorival', 'gallardo', 'vojvoda', 'roger', 'outro'];

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { candidateId, candidateName, nome, email, cpf, nasc } = body;

  /* Valida candidateId */
  if (!ALLOWED_IDS.includes(candidateId)) {
    return new Response(JSON.stringify({ error: 'Invalid candidate' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /* Valida campos obrigatórios */
  if (!nome || !email || !cpf || !nasc || !candidateName) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!APPS_SCRIPT_URL) {
    return new Response(JSON.stringify({ error: 'Backend not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'vote',
        candidateId,
        candidateName,
        nome,
        email,
        cpf,
        nasc,
        timestamp: new Date().toISOString()
      })
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Backend error' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
