// footballwhoami.com: serves the static site, and counts store clicks and page engagement in Workers
// Analytics Engine (dataset fwai_site_events). Anonymous by design: no cookies, no IP addresses, no ids.
// Each data point is one event: blob1 event, blob2 detail (which button or step), blob3 country,
// blob4 device (ios, android, desktop). Query it with the SQL API (site/stats.sh).

const STORES = {
  appstore: 'https://apps.apple.com/app/id1338147291',
  play: 'https://play.google.com/store/apps/details?id=com.footballtrivia',
};
// The only events the page may send, so the log can't fill with junk.
const EVENTS = new Set(['view', 'story', 'story_end', 'try', 'clue', 'guess', 'correct', 'giveup', 'end']);

function device(ua = '') {
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}

function record(env, request, event, detail = '') {
  if (/bot|crawl|spider|preview|curl|wget/i.test(request.headers.get('user-agent') || '')) return;
  try {
    env.EVENTS?.writeDataPoint({
      indexes: [event],
      blobs: [event, String(detail).slice(0, 32), request.cf?.country || '', device(request.headers.get('user-agent') || '')],
      doubles: [1],
    });
  } catch {
    // counting must never break the site
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Store buttons go through here, so a click is counted, then sent on to the store.
    const go = url.pathname.match(/^\/go\/(appstore|play)\/?$/);
    if (go) {
      record(env, request, 'store_' + go[1], url.searchParams.get('from') || '');
      return Response.redirect(STORES[go[1]], 302);
    }

    // Engagement pings from the page (navigator.sendBeacon): an event name and an optional detail.
    if (url.pathname === '/e' && request.method === 'POST') {
      const [event, detail] = (await request.text()).slice(0, 80).split(':');
      if (EVENTS.has(event)) record(env, request, event, detail);
      return new Response(null, { status: 204 });
    }

    return env.ASSETS.fetch(request);
  },
};
