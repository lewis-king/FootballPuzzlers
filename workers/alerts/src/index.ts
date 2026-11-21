/**
 * New-pack alerts for Football Who Am I.
 *
 *   PUT    /token  {token, platform}  a phone opts in (or refreshes its token)
 *   DELETE /token  {token}            a phone opts out
 *   POST   /send   {pack, title, body} Lewis announces a pack (Authorization: Bearer SEND_SECRET)
 *
 * `pack` is the new pack's id in the app. A phone on an older version doesn't know it, so tapping
 * the notification opens the store page to update (mobile/src/services/alerts.native.ts).
 *
 * The only thing stored is the Expo push token, keyed by itself, with the platform and when it was
 * last seen. Tokens Expo reports as no longer registered (app uninstalled) are deleted on send.
 */
interface Env {
  TOKENS: KVNamespace;
  SEND_SECRET: string;
}

const TOKEN = /^Expo(nent)?PushToken\[[A-Za-z0-9_-]{10,100}\]$/;
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/token' && (req.method === 'PUT' || req.method === 'DELETE')) {
      const body = (await req.json().catch(() => null)) as { token?: string; platform?: string } | null;
      if (!body?.token || !TOKEN.test(body.token)) return json({ error: 'bad token' }, 400);
      if (req.method === 'DELETE') await env.TOKENS.delete(body.token);
      else {
        const platform = body.platform === 'ios' || body.platform === 'android' ? body.platform : 'unknown';
        await env.TOKENS.put(body.token, JSON.stringify({ platform, seen: new Date().toISOString().slice(0, 10) }));
      }
      return json({ ok: true });
    }
    if (url.pathname === '/send' && req.method === 'POST') {
      if (!env.SEND_SECRET || req.headers.get('authorization') !== `Bearer ${env.SEND_SECRET}`) return json({ error: 'no' }, 401);
      const msg = (await req.json().catch(() => null)) as { pack?: string; title?: string; body?: string; dryRun?: boolean } | null;
      if (!msg?.pack || !msg.title || !msg.body) return json({ error: 'pack, title and body needed' }, 400);
      return json(await send(env, msg.pack, msg.title, msg.body, !!msg.dryRun));
    }
    return json({ error: 'not found' }, 404);
  },
};

async function allTokens(env: Env): Promise<string[]> {
  const out: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await env.TOKENS.list({ cursor });
    out.push(...page.keys.map((k) => k.name));
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return out;
}

async function send(env: Env, pack: string, title: string, body: string, dryRun: boolean) {
  const tokens = await allTokens(env);
  if (dryRun) return { tokens: tokens.length, sent: 0 };
  let sent = 0;
  const gone: string[] = [];
  // Expo takes up to 100 messages per request. Each batch is one subrequest (50 per run on the
  // Workers free plan, so about 5,000 phones; split the send or move to the paid plan beyond that).
  for (let i = 0; i < tokens.length; i += 100) {
    const batch = tokens.slice(i, i + 100);
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(batch.map((to) => ({ to, title, body, data: { pack }, sound: null, channelId: 'new-packs' }))),
    });
    const out = (await res.json().catch(() => null)) as { data?: { status: string; details?: { error?: string } }[] } | null;
    out?.data?.forEach((t, j) => {
      if (t.status === 'ok') sent++;
      else if (t.details?.error === 'DeviceNotRegistered') gone.push(batch[j]);
    });
  }
  await Promise.all(gone.map((t) => env.TOKENS.delete(t)));
  return { tokens: tokens.length, sent, removed: gone.length };
}
