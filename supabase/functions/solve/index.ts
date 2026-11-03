// G-NOTES maths solver. The browser sends a picture of the lassoed handwriting;
// this function checks the caller is signed in, asks Claude, and returns the
// worked solution. The Anthropic key lives only here, as a Supabase secret.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const SYSTEM = `You solve handwritten maths from a photo of a student's notes.
Read the handwriting, state the problem in one line, then solve it step by step and finish with the final answer on its own line starting "Answer:".
Write in plain text with Unicode maths (x², √, ∫, ≤, π, ½). Do not use LaTeX or markdown headings. Keep it as short as a clear solution allows.
If the handwriting is unreadable or contains no maths, say what is unclear instead of guessing.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  try {
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return json({ error: 'Sign in to use the solver' }, 401);

    const { image } = await req.json();
    if (typeof image !== 'string' || image.length < 100 || image.length > 5_000_000) {
      return json({ error: 'Bad image' }, 400);
    }
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: Deno.env.get('SOLVER_MODEL') ?? 'claude-sonnet-5-5',
        max_tokens: 2000,
        system: SYSTEM,
        messages: [{ role: 'user', content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/png', data: image } },
          { type: 'text', text: 'Solve the maths in this image.' },
        ] }],
      }),
    });
    const j = await r.json();
    if (!r.ok) return json({ error: j?.error?.message ?? 'The solver is unavailable' }, 502);
    const text = (j.content ?? []).filter((b: { type: string }) => b.type === 'text').map((b: { text: string }) => b.text).join('\n');
    return json({ text });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
