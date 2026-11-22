// Store screenshots from the real app: walks an example player through the web build and saves raw
// 440 x 956 @3x captures to store/raw/. Serve the web build first (npx serve -s web -l 8765), then:
//   PLAYWRIGHT=<path to playwright/index.mjs> node store/capture.mjs
const { chromium } = await import(process.env.PLAYWRIGHT);
const URL = process.env.APP_URL || 'http://localhost:8765';
// IPAD=1 captures at iPad 13" size (1032 x 1376 points @2x) into store/raw-ipad/ for the iPad frames.
const IPAD = !!process.env.IPAD;
const OUT = new globalThis.URL(IPAD ? './raw-ipad/' : './raw/', import.meta.url).pathname;
const TODAY = Math.floor((Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) - Date.UTC(2020, 0, 1)) / 86400000);
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

// The example player: Starter Pack finished, eight into the 2020s, six days in a row.
const state = {
  answered: [...range(1, 90), ...range(213, 220)],
  clues: {}, letters: {},
  // a believable guess count for the finished Starter Pack: most first time, some taking a few
  // the Starter Pack took 12 days, first answer to last
  solvedOn: Object.fromEntries(range(1, 90).map((id) => [id, TODAY - 12 + Math.floor((id - 1) / 8)])),
  guesses: Object.fromEntries(range(1, 90).map((id) => [id, [1, 1, 2, 1, 3, 1, 1, 2, 1, 4][id % 10]])), // lastDay counts days from 1 Jan 2020, as in game.ts dayNumber(); yesterday, so today's answer makes it 7
  streak: { days: 6, lastDay: Math.floor((Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) - Date.UTC(2020, 0, 1)) / 86400000) - 1 },
  // owns the paid packs: the stores don't allow prices in screenshots
  purchased: ['com.footballwhoami.worldcup_1', 'com.footballwhoami.championsleague_1'],
  alerts: 'on', alertAsks: 1, legacyChecked: true, legacyImported: null, lastPack: 'twenties', rateAsks: 2,
};
const b = await chromium.launch();
const p = await b.newPage(IPAD ? { viewport: { width: 1032, height: 1376 }, deviceScaleFactor: 2 } : { viewport: { width: 440, height: 956 }, deviceScaleFactor: 3 });
await p.goto(URL);
await p.evaluate((s) => localStorage.setItem('progress-v1', JSON.stringify({ state: s, version: 1 })), state);
const seed = async (s) => { await p.goto(URL); await p.evaluate((x) => localStorage.setItem('progress-v1', JSON.stringify({ state: x, version: 1 })), s); };
// Several frames of a confetti screen (Lewis: pick the one where confetti hides least; in Nov 2026 correct-2100 and
// complete-2500 were best (after the medal fix), copied to correct.png and complete.png), to pick the one where the confetti covers least (store/raw/<name>-<ms>.png)
const burst = async (name, times) => { let t0 = 0; for (const t of times) { await p.waitForTimeout(t - t0); t0 = t; await p.screenshot({ path: OUT + `${name}-${t}.png` }); } console.log(name, times.join(',')); };
const shot = async (name, wait = 1800) => { await p.waitForTimeout(wait); await p.screenshot({ path: OUT + name + '.png' }); console.log(name); };

await p.goto(URL + '/'); await shot('home', 2500);
await p.goto(URL + '/pack/twenties'); await p.waitForTimeout(2000);
// blur the solved players' names, so the screenshots don't spoil the pack
await p.evaluate(() => document.querySelectorAll('[aria-label*=", solved:"]').forEach((t) => {
  const texts = t.querySelectorAll('div[dir="auto"]'); const name = texts[texts.length - 1];
  if (name) name.style.filter = 'blur(4px)';
}));
await shot('pack', 600);
// The hook: Tammy Abraham, Lewis's favourite in the pack (question 105, so the player is 104 in).
await seed({ ...state, answered: [...range(1, 90), ...range(213, 316)] });
// Pick Forward and English on the clue sheet, then show the question with both answers on it (Lewis).
await p.goto(URL + '/question/317'); await p.waitForTimeout(1500);
await p.getByRole('button', { name: /^Clues/ }).click(); await p.waitForTimeout(900);
await p.getByLabel('Reveal Forward').click(); await p.waitForTimeout(300);
await p.getByLabel('Reveal English').click(); await shot('clues', 900);
await p.getByRole('button', { name: 'Back to the question' }).click(); await shot('question', 1200);
// Correct: Harry Kane, a name everyone knows.
await seed(state);
await p.goto(URL + '/question/221'); await p.waitForTimeout(1500);
await p.getByLabel('Your answer').fill('Kane');
await p.getByRole('button', { name: /check/i }).last().click();
await shot('checking', 700);
await p.waitForURL(/correct/, { timeout: 8000 }); await burst('correct', [600, 900, 1200, 1500, 1800, 2100, 2400, 2800]);
await p.goto(URL + '/complete?pack=starter'); await burst('complete', [1600, 1900, 2200, 2500, 2800, 3100, 3500, 4000]);
await b.close();
