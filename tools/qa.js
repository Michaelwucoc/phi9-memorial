const { chromium } = require('/Users/wujian/Documents/Phi9/fetch/node_modules/playwright-core');
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.HOME + '/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing' });
  const errors = [];
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    page.on('pageerror', e => errors.push(`JS ${e.message}`));
    page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    await page.goto('http://127.0.0.1:8931/', { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    await page.evaluate(() => { sessionStorage.setItem('phi9-booted', '1'); document.body.dataset.boot = 'done'; document.querySelector('#boot')?.remove(); });
    await page.locator('#decrypt').scrollIntoViewIfNeeded();
    const total = await page.locator('.decrypt-story').evaluate(el => el.offsetHeight);
    const start = await page.evaluate(() => scrollY);
    const timeline = [];
    for (const fraction of [.04, .20, .39, .54, .68, .82, .96, .39, .04]) {
      await page.evaluate(([y, h, f]) => scrollTo(0, y + (h - innerHeight) * f), [start, total, fraction]);
      await page.waitForTimeout(80);
      timeline.push(await page.locator('#decrypt-stage-index').textContent());
    }
    await page.screenshot({ path: `/tmp/phi9-stage-${viewport.width}.png` });
    const decryptImages = await page.locator('#decrypt img').count();
    const loadedImages = await page.locator('#decrypt img').evaluateAll(imgs => imgs.every(img => img.complete && img.naturalWidth > 0));
    await page.locator('#music').scrollIntoViewIfNeeded();
    await page.locator('.t-btn.store').first().click();
    const storedCount = await page.locator('#archive-slot-count').textContent();
    await page.locator('.archive-item').first().click();
    await page.waitForFunction(() => document.querySelector('#main-audio').currentTime > 0.25);
    await page.waitForTimeout(350);
    const audio = await page.evaluate(() => ({ playing: !document.querySelector('#main-audio').paused, time: document.querySelector('#main-audio').currentTime, spectrumHidden: document.querySelector('#viz').hidden, canvasHasDrawing: document.querySelector('#viz').toDataURL().length > 1500, tracks: document.querySelectorAll('.track').length, archiveCount: document.querySelector('#archive-slot-count').textContent }));
    console.log(JSON.stringify({ viewport, timeline, decryptImages, loadedImages, storedCount, audio }, null, 2));
    await page.close();
  }
  console.log('ERRORS:', JSON.stringify(errors, null, 2));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
