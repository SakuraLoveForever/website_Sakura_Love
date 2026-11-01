const { test, expect } = require('@playwright/test');

test('移除 Haru，并把旧角色偏好回退到有效角色', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('live2dModel', 'haru'));
  await page.goto('/');
  await expect(page.locator('#live2d-model option[value="haru"]')).toHaveCount(0);
  expect(await page.evaluate(() => getLive2dModelKey('haru'))).toBe('tutu');
});

test('切回已加载角色复用实例，快速连续切换以最后选择为准', async ({ page }) => {
  test.setTimeout(90000);
  await page.addInitScript(() => localStorage.setItem('live2dModel', 'hiyori'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForFunction(() => typeof live2dActiveModel !== 'undefined' && live2dActiveModel?.internalModel, null, { timeout: 60000 });
  const result = await page.evaluate(async () => {
    const original = live2dActiveModel;
    const width = original.width;
    await switchLive2dModel('mao');
    const start = performance.now();
    await switchLive2dModel('hiyori');
    const elapsed = performance.now() - start;
    const reused = live2dActiveModel === original;
    const sameWidth = Math.abs(live2dActiveModel.width - width) < 1;
    await Promise.all([switchLive2dModel('mao'), switchLive2dModel('hiyori')]);
    return { reused, sameWidth, elapsed, lastSelectionWon: live2dActiveModel === original, children: live2dApp.stage.children.length };
  });
  expect(result.reused).toBe(true);
  expect(result.sameWidth).toBe(true);
  expect(result.lastSelectionWon).toBe(true);
  expect(result.children).toBe(1);
  expect(result.elapsed).toBeLessThan(200);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(async () => { await switchLive2dModel("mao"); await switchLive2dModel("hiyori"); });
  await expect.poll(() => page.evaluate(() => ({ children: live2dApp.stage.children.length, alpha: live2dActiveModel.alpha, destroyed: live2dActiveModel.destroyed }))).toEqual({ children: 1, alpha: 1, destroyed: false });
});
