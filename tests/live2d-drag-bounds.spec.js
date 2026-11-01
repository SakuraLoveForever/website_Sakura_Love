const { test, expect } = require('@playwright/test');

test('拖动边界以可见角色为准，透明留白可移出视口，刷新后保持位置', async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1864, height: 996 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => { if (!localStorage.getItem('live2dModel')) localStorage.setItem('live2dModel', 'emilia'); });
  await page.goto('/');
  await page.waitForFunction(() => typeof live2dActiveModel !== 'undefined' && live2dActiveModel?.internalModel);
  const visibleBounds = () => page.evaluate(() => {
    const canvas = live2dCanvas, rect = canvas.getBoundingClientRect();
    const copy = document.createElement('canvas'); copy.width = canvas.width; copy.height = canvas.height;
    const context = copy.getContext('2d'); context.drawImage(canvas, 0, 0);
    const pixels = context.getImageData(0, 0, copy.width, copy.height).data;
    let minX = copy.width, maxX = -1, minY = copy.height, maxY = -1;
    for (let y = 0; y < copy.height; y++) for (let x = 0; x < copy.width; x++) {
      if (pixels[(y * copy.width + x) * 4 + 3] <= 24) continue;
      minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
    return { left: rect.left + minX / copy.width * rect.width, right: rect.left + (maxX + 1) / copy.width * rect.width,
      top: rect.top + minY / copy.height * rect.height, bottom: rect.top + (maxY + 1) / copy.height * rect.height,
      canvasLeft: rect.left, canvasTop: rect.top };
  });
  for (const size of [100, 140]) {
    await page.evaluate(async size => {
      setLive2dSizePercent(size);
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const rect = live2dCanvas.getBoundingClientRect(), x = rect.left + rect.width / 2, y = rect.top + rect.height * .6;
      const target = document.elementFromPoint(x, y);
      target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 7, button: 0, clientX: x, clientY: y }));
      document.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 7, clientX: -10000, clientY: 10000 }));
      document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 7, clientX: -10000, clientY: 10000 }));
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }, size);
    const bounds = await visibleBounds();
    expect(bounds.left).toBeGreaterThanOrEqual(0);
    expect(bounds.left).toBeLessThanOrEqual(28);
    expect(996 - bounds.bottom).toBeGreaterThanOrEqual(0);
    expect(996 - bounds.bottom).toBeLessThanOrEqual(28);
    expect(bounds.canvasLeft).toBeLessThan(0);
  }
  await page.evaluate(() => setLive2dSettingsOpen(true));
  const handle = await page.locator('#live2d-resize-handle').boundingBox();
  const panel = await page.locator('#live2d-settings-panel').boundingBox();
  expect(handle.x).toBeGreaterThanOrEqual(8); expect(handle.y + handle.height).toBeLessThanOrEqual(989);
  expect(panel.x).toBeGreaterThanOrEqual(8); expect(panel.y + panel.height).toBeLessThanOrEqual(989);
  await page.evaluate(() => setLive2dSettingsOpen(false));
  await page.screenshot({ path: 'artifacts/live2d-drag-visible-bounds.png' });
  const before = await visibleBounds();
  await page.reload();
  await page.waitForFunction(() => typeof live2dActiveModel !== 'undefined' && live2dActiveModel?.internalModel);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const after = await visibleBounds();
  expect(after.canvasLeft).toBeCloseTo(before.canvasLeft, 0);
  expect(after.canvasTop).toBeCloseTo(before.canvasTop, 0);
});
