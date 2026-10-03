const { test, expect } = require('@playwright/test');

test('看板娘关闭再开启后头部仍完整显示', async ({ page }) => {
  test.setTimeout(90000);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const canvas = page.locator('#live2d-canvas');
  const headPixels = () => page.evaluate(() => {
    const source = document.querySelector('#live2d-canvas');
    const sample = document.createElement('canvas');
    sample.width = source.width;
    sample.height = source.height;
    const context = sample.getContext('2d', { willReadFrequently: true });
    context.drawImage(source, 0, 0);
    const { data, width, height } = context.getImageData(0, 0, sample.width, Math.floor(sample.height * .35));
    let pixels = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 50) pixels++;
    return pixels / (width * height);
  });
  await expect.poll(headPixels, { timeout: 45000 }).toBeGreaterThan(.02);
  for (let attempt = 0; attempt < 2; attempt++) {
    await page.locator('#live2d-toggle').click();
    await expect(page.locator('#live2d-widget')).toHaveClass(/live2d-hidden/);
    await page.locator('#live2d-toggle').click();
    await expect(page.locator('#live2d-widget')).not.toHaveClass(/live2d-hidden/);
    await expect.poll(headPixels, { timeout: 10000 }).toBeGreaterThan(.02);
  }
});
