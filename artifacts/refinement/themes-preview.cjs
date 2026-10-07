const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1536, height: 960 } });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('http://127.0.0.1:8080');
  await page.evaluate(() => { live2dWidget.style.visibility = 'hidden'; });
  for (const theme of ['apple', 'shadcn', 'tailwind']) {
    await page.evaluate(theme => applyStyle(theme), theme);
    for (const section of ['hero', 'projects', 'page-bottom']) {
      await page.locator(`#${section}`).evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
      await page.screenshot({ path: `artifacts/refinement/${theme}-${section}.png` });
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const theme of ['shadcn', 'tailwind']) {
    await page.evaluate(theme => applyStyle(theme), theme);
    await page.locator('#page-bottom').evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
    await page.screenshot({ path: `artifacts/refinement/${theme}-mobile.png` });
  }
  await page.evaluate(() => showClickText(innerWidth - 2, innerHeight - 40, '摆脱低俗的多巴胺，追随高级的内啡肽'));
  await page.screenshot({ path: 'artifacts/refinement/quote-edge-fixed.png' });
  console.log('Captured three desktop themes, two mobile themes and the edge quote.');
  await browser.close();
})();
