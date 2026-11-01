import { test, expect } from '@playwright/test';

test('调整看板娘大小时设置面板固定在屏幕上，关闭后才重新依附人物', async ({ page }) => {
  await page.setViewportSize({ width: 1546, height: 658 });
  await page.goto('/');
  await page.waitForFunction(() => window.__live2dReady !== false);
  await page.waitForTimeout(1200);
  await page.evaluate(() => setLive2dSettingsOpen(true));
  await page.waitForTimeout(300);

  const read = () => page.evaluate(() => {
    const panel = document.querySelector('.live2d-settings-panel');
    const rect = panel.getBoundingClientRect();
    return { x: Math.round(rect.x), y: Math.round(rect.y), pinned: panel.parentElement?.classList.contains('live2d-panel-pinned') };
  });

  const start = await read();
  const handle = await page.locator('#live2d-resize-handle').boundingBox();
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
  await page.mouse.down();
  for (let step = 1; step <= 6; step += 1) {
    await page.mouse.move(handle.x + handle.width / 2 + step * 14, handle.y + handle.height / 2 - step * 12);
    await page.waitForTimeout(70);
    const now = await read();
    // The widget is bottom-anchored: without a viewport pin every frame walks the panel up.
    expect(now.x).toBe(start.x);
    expect(now.y).toBe(start.y);
  }
  await page.mouse.up();
  await page.waitForTimeout(250);
  expect((await read()).y).toBe(start.y);

  await page.evaluate(() => setLive2dSettingsOpen(false));
  await page.waitForTimeout(250);
  const closed = await read();
  expect(closed.pinned).toBe(false);
  // Reattached to the character, which is now taller, so it must have moved.
  expect(closed.y).not.toBe(start.y);
});
