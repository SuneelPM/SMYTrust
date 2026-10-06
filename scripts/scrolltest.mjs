import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const routes = ['/', '/about/', '/services/', '/activities/', '/csr-fund/', '/donate/', '/contact/', '/certificate/'];
let bad = 0;
for (const r of routes) {
  await page.goto('http://localhost:4321' + r, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  // scroll down the whole page in steps so every ScrollTrigger fires
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.7;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 220));
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise(r => setTimeout(r, 900));
  });
  const res = await page.evaluate(() => {
    const hidden = [...document.querySelectorAll('[data-reveal], [data-reveal-group] > *')]
      .filter(el => getComputedStyle(el).visibility === 'hidden');
    return { n: hidden.length, sample: hidden.slice(0,3).map(e => e.tagName+'.'+(e.className||'').toString().slice(0,40)) };
  });
  if (res.n) { bad++; console.log(`  ${r.padEnd(16)} STILL HIDDEN: ${res.n}  e.g. ${res.sample.join(', ')}`); }
  else console.log(`  ${r.padEnd(16)} all revealed OK`);
}
console.log(bad ? `\n${bad} route(s) with unreachable content` : '\nAll content reveals after scroll.');
await browser.close();
