const { chromium } = require('/Users/wujian/Documents/Phi9/fetch/node_modules/playwright-core');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.HOME + '/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing' });
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  await page.goto('http://127.0.0.1:8931/', { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  await page.evaluate(() => { sessionStorage.setItem('phi9-booted', '1'); document.body.dataset.boot = 'done'; document.querySelector('#boot')?.remove(); });
  await page.locator('#decrypt').scrollIntoViewIfNeeded();
  const start = await page.evaluate(() => ({ y: scrollY, top: document.querySelector('#decrypt-story').getBoundingClientRect().top, height: document.querySelector('#decrypt-story').offsetHeight, vh: innerHeight }));
  const expected = [1,2,2,3,3,4,5,6,7,7,4,2,1];
  const frames = [];
  for (const [n, p] of expected.entries()) {
    const fractions = [.02,.11,.20,.35,.42,.51,.63,.75,.92,.98,.51,.20,.02];
    await page.evaluate(([y, top, height, vh, f]) => scrollTo(0, y + top + Math.max(1, height - vh) * f), [start.y,start.top,start.height,start.vh,fractions[n]]);
    await page.waitForFunction(target => document.querySelector('#decrypt-stage-index').textContent.startsWith(String(target).padStart(2,'0')), p);
    const actual = await page.locator('#decrypt-stage-index').textContent();
    frames.push(actual);
    assert.equal(actual, `${String(p).padStart(2,'0')} / 07`);
  }
  await page.evaluate(([y, top, height, vh]) => scrollTo(0, y + top + (height - vh) * .20), [start.y,start.top,start.height,start.vh]);
  await page.waitForFunction(() => document.querySelector('#decrypt-stage-index').textContent.startsWith('02'));
  const facts = await page.evaluate(() => ({
    imageCount: document.querySelectorAll('#decrypt img').length,
    imagesLoaded: [...document.querySelectorAll('#decrypt img')].every(x => x.complete && x.naturalWidth > 0),
    fragments: document.querySelectorAll('.fragment-grid i').length,
    title: getComputedStyle(document.querySelector('.decrypt-heading')).visibility,
    headings: [...document.querySelectorAll('.beat-copy')].every(el => { const r=el.getBoundingClientRect(); return r.width>0 && r.height>0; }),
    imageCenter: (() => { const r=document.querySelector('.fft-original img').getBoundingClientRect(); return Math.abs((r.top+r.bottom)/2-innerHeight/2) < 3; })()
  }));
  assert.equal(facts.imageCount, 2);
  assert.equal(facts.imagesLoaded, true);
  assert.equal(facts.fragments, 13);
  assert.equal(facts.title, 'visible');
  assert.equal(facts.headings, true);
  assert.equal(facts.imageCenter, true);
  await page.screenshot({ path: '/tmp/phi9-decrypt-fixed.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => scrollTo(0, document.querySelector('#decrypt').offsetTop));
  await page.waitForFunction(() => document.querySelector('.decrypt-stage').getBoundingClientRect().top === 0);
  const mobile = await page.evaluate(() => ({ stageHeight: Math.round(document.querySelector('.decrypt-stage').getBoundingClientRect().height), overflow: document.documentElement.scrollWidth > innerWidth }));
  assert.equal(mobile.overflow, false);
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log(JSON.stringify({ frames, facts, mobile, errors }, null, 2));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
