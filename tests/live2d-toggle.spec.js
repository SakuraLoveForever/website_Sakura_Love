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
  const transparentDrag = await page.evaluate(() => {
    const source = document.querySelector('#live2d-canvas');
    const rect = source.getBoundingClientRect();
    const bounds = live2dActiveModel.getBounds();
    const sample = document.createElement('canvas');
    sample.width = source.width;
    sample.height = source.height;
    const context = sample.getContext('2d');
    context.drawImage(source, 0, 0);
    const pixels = context.getImageData(0, 0, sample.width, sample.height).data;
    for (let y = Math.max(0, bounds.y); y < Math.min(rect.height, bounds.y + bounds.height); y += 8) {
      for (let x = Math.max(0, bounds.x); x < Math.min(rect.width, bounds.x + bounds.width); x += 8) {
        const px = Math.floor(x / rect.width * sample.width);
        const py = Math.floor(y / rect.height * sample.height);
        if (pixels[(py * sample.width + px) * 4 + 3] > 0) continue;
        const target = document.elementFromPoint(rect.left + x, rect.top + y);
        if (!target || target.closest('a,button,input,select,summary,.side-nav')) continue;
        const event = new PointerEvent('pointerdown', { clientX: rect.left + x, clientY: rect.top + y, pointerId: 99, bubbles: true, cancelable: true });
        target.dispatchEvent(event);
        return { prevented: event.defaultPrevented, dragging: live2dWidget.classList.contains('dragging') };
      }
    }
    return null;
  });
  /*
   * 2026-10-06：拖拽判定由「像素命中」改为「整块看板娘面板」——
   * 因为角色本体只占面板中间一小块，抓到空白处就拖不动。
   * 所以透明像素处的 dragging 现在是 true；但 prevented 必须仍然是 false，
   * 否则面板下方的链接/按钮会被吞掉，那才是真正的回归。
   */
  expect(transparentDrag).toEqual({ prevented: false, dragging: true });
  // 释放这次合成的按下，否则后续步骤的鼠标移动会被当成拖拽
  await page.evaluate(() => {
    document.dispatchEvent(new PointerEvent('pointerup', { pointerId: 99, bubbles: true }));
  });
  await expect(page.locator('#live2d-widget')).not.toHaveClass(/dragging/);
  for (let attempt = 0; attempt < 2; attempt++) {
    await page.locator('#live2d-toggle').click();
    await expect(page.locator('#live2d-widget')).toHaveClass(/live2d-hidden/);
    expect(await page.evaluate(() => live2dApp.ticker.started)).toBe(false);
    expect(await page.evaluate(() => live2dActiveModel.autoUpdate)).toBe(false);
    await page.locator('#live2d-toggle').click();
    await expect(page.locator('#live2d-widget')).not.toHaveClass(/live2d-hidden/);
    await expect.poll(headPixels, { timeout: 10000 }).toBeGreaterThan(.02);
    expect(await page.evaluate(() => live2dApp.ticker.started)).toBe(true);
    expect(await page.evaluate(() => live2dActiveModel.autoUpdate)).toBe(true);
  }
  await page.setViewportSize({ width: 354, height: 767 });
  expect(await page.evaluate(() => live2dApp.ticker.started)).toBe(false);
  expect(await page.evaluate(() => live2dActiveModel.autoUpdate)).toBe(false);
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect.poll(() => page.evaluate(() => live2dApp.ticker.started)).toBe(true);
  await page.evaluate(async () => { await switchLive2dModel('hiyori'); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => page.evaluate(() => ({
    running: live2dApp.ticker.started,
    alpha: live2dActiveModel.alpha,
    children: live2dApp.stage.children.length,
  }))).toEqual({ running: false, alpha: 1, children: 1 });
});
