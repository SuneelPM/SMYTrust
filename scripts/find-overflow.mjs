import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:4321';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();

for (const route of ['/services/', '/contact/', '/donate/']) {
  await page.goto(BASE + route, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const culprits = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const out = [];
    for (const el of document.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right > vw + 1 || r.left < -1) {
        out.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.getAttribute('class') || '').slice(0, 60),
          left: Math.round(r.left),
          right: Math.round(r.right),
          width: Math.round(r.width),
        });
      }
    }
    // keep the outermost offenders only
    return { vw, culprits: out.slice(0, 12) };
  });

  console.log(`\n${route}  viewport=${culprits.vw}`);
  culprits.culprits.forEach((c) =>
    console.log(`  <${c.tag} class="${c.cls}">  left:${c.left} right:${c.right} w:${c.width}`),
  );
}

await browser.close();
