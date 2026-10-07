const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1536, height: 960 } });
  await page.goto('http://127.0.0.1:8080');
  await page.waitForFunction(() => typeof live2dActiveModel !== 'undefined' && live2dActiveModel?.internalModel);
  for (const [name, target] of [['hero', '.hero'], ['projects', '#projects'], ['footer', '#page-bottom']]) {
    await page.locator(target).scrollIntoViewIfNeeded();
    await page.waitForTimeout(650);
    await page.screenshot({ path: path.join(__dirname, name + '-after.png') });
  }
  await page.evaluate(() => { live2dWidget.classList.add('live2d-custom-position'); live2dWidget.style.left='12px'; live2dWidget.style.top='280px'; live2dWidget.style.bottom='auto'; });
  const b = await page.evaluate(() => { const b=live2dActiveModel.getBounds(),r=live2dCanvas.getBoundingClientRect();return {x:r.left+b.x+b.width/2,y:r.top+b.y+b.height*.7}; });
  await page.mouse.click(b.x,b.y);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(__dirname, 'mascot-after.png') });
  console.log(await page.evaluate(() => ({ build:document.documentElement.dataset.build, motion:!!window.Motion, footer:document.querySelector('footer').getBoundingClientRect().height, music:document.querySelector('#music-library').getBoundingClientRect().height })));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#page-bottom').scrollIntoViewIfNeeded();
  await page.waitForTimeout(650);
  await page.screenshot({ path:path.join(__dirname,'mobile-after.png') });
  await browser.close();
})();
