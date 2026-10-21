const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1536, height: 960 } });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('http://127.0.0.1:8080');
  await page.waitForFunction(() => typeof live2dActiveModel !== 'undefined' && live2dActiveModel?.internalModel);
  await page.screenshot({ path: 'artifacts/refinement/apple-blended-header.png' });
  await page.locator('#projects').evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
  await page.screenshot({ path: 'artifacts/refinement/apple-blended-projects.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: 'artifacts/refinement/apple-blended-mobile.png' });
  await browser.close();
})();
