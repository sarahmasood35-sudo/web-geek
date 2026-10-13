// Full-page screenshot: node screenshot.mjs <url> [label]
// Saves to "temporary screenshots/screenshot-N[-label].png", never overwriting.
import puppeteer from 'puppeteer';
import { mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const [url = 'http://localhost:3000', label] = process.argv.slice(2);
const DIR = 'temporary screenshots';

await mkdir(DIR, { recursive: true });
const taken = (await readdir(DIR))
  .map((f) => Number(f.match(/^screenshot-(\d+)/)?.[1]))
  .filter(Number.isFinite);
const n = taken.length ? Math.max(...taken) + 1 : 1;
const file = join(DIR, `screenshot-${n}${label ? `-${label}` : ''}.png`);

const browser = await puppeteer.launch();
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle0' });
  // Reveal-on-scroll content stays hidden until scrolled into view, so scroll through the page first.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 250));
    }
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: file, fullPage: true });
  console.log(`Saved ${file}`);
} finally {
  await browser.close();
}
