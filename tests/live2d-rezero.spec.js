const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const characters = { rem: '雷姆', ram: '拉姆', emilia: '艾米利亚' };

test('三位 Re:Zero 看板娘使用本地资源，能显示、待机、跟随鼠标并切换', async ({ page }) => {
  test.setTimeout(120000);
  await page.addInitScript(() => localStorage.setItem('live2dModel', 'hiyori'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const [key, name] of Object.entries(characters)) {
    await expect(page.locator('#live2d-model option[value="' + key + '"]')).toHaveText(name);
  }
  await page.waitForFunction(() => typeof switchLive2dModel === 'function');
  fs.mkdirSync('artifacts/live2d-rezero', { recursive: true });
  for (const key of Object.keys(characters)) {
    await page.evaluate(async key => { await switchLive2dModel(key); }, key);
    const result = await page.evaluate(key => {
      const model = live2dActiveModel;
      const config = model.internalModel.settings;
      const pixels = live2dApp.renderer.extract.pixels(live2dApp.stage);
      let opaque = 0;
      for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 24) opaque++;
      const bounds = model.getBounds();
      return { url: config.url, opaque, width: bounds.width, height: bounds.height,
        stageCount: live2dApp.stage.children.length, idle: config.motions.Idle.length,
        eyeIndex: model.internalModel.coreModel.getParameterIndex('PARAM_EYE_BALL_X') };
    }, key);
    expect(result.url).toContain('/rezero/' + key + '/');
    expect(result.opaque).toBeGreaterThan(1000);
    expect(result.width).toBeGreaterThan(100);
    expect(result.height).toBeLessThanOrEqual(560);
    expect(result.stageCount).toBe(1);
    expect(result.idle).toBeGreaterThan(0);
    expect(result.eyeIndex).toBeGreaterThanOrEqual(0);
    await page.mouse.move(1270, 120);
    await expect.poll(() => page.evaluate(() => live2dActiveModel.internalModel.coreModel.getParameterValueById('PARAM_EYE_BALL_X'))).toBeGreaterThan(0);
    await page.mouse.move(10, 120);
    await expect.poll(() => page.evaluate(() => live2dActiveModel.internalModel.coreModel.getParameterValueById('PARAM_EYE_BALL_X'))).toBeLessThan(0);
    await page.locator('#live2d-canvas').screenshot({ path: path.join('artifacts/live2d-rezero', key + '.png') });
  }
  expect(await page.evaluate(() => live2dCachedModels.size)).toBeLessThanOrEqual(3);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(async () => { await switchLive2dModel('rem'); });
  await expect.poll(() => page.evaluate(() => live2dApp.stage.children.length)).toBe(1);
  await expect.poll(() => page.evaluate(() => live2dActiveModel.internalModel.motionManager.playing)).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  const widget = await page.locator('#live2d-widget').boundingBox();
  expect(widget.x).toBeGreaterThanOrEqual(0);
  expect(widget.x + widget.width).toBeLessThanOrEqual(391);
});
