const { test, expect } = require('@playwright/test');

test('连续缩放的每个画面都保留角色，暂停动画时也不会清空画布', async ({ page }) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await waitForLive2d(page);
  await page.evaluate(() => setLive2dSettingsOpen(true));
  for (const reducedMotion of ['reduce', 'no-preference']) {
    await page.emulateMedia({ reducedMotion });
    const samples = await page.evaluate(async () => {
      const samples = [];
      const gl = live2dApp.renderer.gl;
      const sample = () => {
        const pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
        gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        let opaque = 0;
        for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 16) opaque++;
        samples.push(opaque);
      };
      for (const size of [60, 80, 120, 150, 100]) {
        live2dSizeInput.value = String(size);
        live2dSizeInput.dispatchEvent(new Event('input', { bubbles: true }));
        for (let frame = 0; frame < 4; frame++) await new Promise(resolve => requestAnimationFrame(() => { sample(); resolve(); }));
      }
      for (const step of ['10', '-10']) {
        document.querySelector(`[data-live2d-size-step="${step}"]`).click();
        for (let frame = 0; frame < 4; frame++) await new Promise(resolve => requestAnimationFrame(() => { sample(); resolve(); }));
      }
      return samples;
    });
    expect(Math.min(...samples), `${reducedMotion} 模式缩放时画布不可为空`).toBeGreaterThan(1000);
  }
});

/**
 * 看板娘「点击后调整大小」（2026-10-06）
 *
 * 原交互要两次点击：点本体 → 弹出小把手（3.6s 后自动消失）→ 再点把手才开面板。
 * 现在点本体直接打开设置面板（一次点击到尺寸滑块），并额外提供拖拽/键盘缩放手柄。
 */

const waitForLive2d = (page) => page.waitForFunction(
  () => typeof live2dActiveModel !== 'undefined' && live2dActiveModel && live2dActiveModel.internalModel,
  null,
  { timeout: 90000 }
);

/** 模型包围盒中心偏下 = 身体，必定命中不透明像素，能真正触发"点击本体" */
const bodyPoint = (page) => page.evaluate(() => {
  const b = live2dActiveModel.getBounds();
  const r = document.querySelector('#live2d-canvas').getBoundingClientRect();
  return { x: r.left + b.x + b.width / 2, y: r.top + b.y + b.height * 0.7 };
});

const sizeState = (page) => page.evaluate(() => ({
  cssVar: Number(live2dWidget.style.getPropertyValue('--live2d-size')),
  stored: Number(localStorage.getItem('live2dSize')),
  slider: Number(document.querySelector('#live2d-size').value),
  label: document.querySelector('#live2d-size-value').textContent,
}));

test('点击看板娘本体直接打开设置面板，一次点击即可调整大小', async ({ page }) => {
  await page.goto('/');
  await waitForLive2d(page);
  const widget = page.locator('#live2d-widget');
  await expect(widget).not.toHaveClass(/live2d-settings-open/);

  const p = await bodyPoint(page);
  await page.mouse.click(p.x, p.y);

  // 一次点击就必须开面板 —— 这是本次需求的核心
  await expect(widget).toHaveClass(/live2d-settings-open/);
  await expect(page.locator('#live2d-settings-toggle')).toHaveAttribute('aria-expanded', 'true');
  // 尺寸滑块可见可用
  await expect(page.locator('#live2d-size')).toBeVisible();
  // 缩放手柄同时出现
  await expect(page.locator('#live2d-resize-handle')).toHaveCSS('pointer-events', 'auto');
  await expect(page.locator('#live2d-resize-handle')).toHaveCSS('opacity', '1');
});

test('拖拽缩放手柄改变尺寸，且不会被当成拖拽移动看板娘', async ({ page }) => {
  await page.goto('/');
  await waitForLive2d(page);
  await page.evaluate(() => localStorage.removeItem('live2dCustomPosition'));

  const p = await bodyPoint(page);
  await page.mouse.click(p.x, p.y);
  await expect(page.locator('#live2d-widget')).toHaveClass(/live2d-settings-open/);

  const before = await sizeState(page);
  const widgetBefore = await page.locator('#live2d-widget').boundingBox();

  const handle = await page.locator('#live2d-resize-handle').boundingBox();
  const startX = handle.x + handle.width / 2;
  const startY = handle.y + handle.height / 2;

  // 手柄在右下角，向右拖 120px → 尺寸应变大
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 120, startY, { steps: 14 });
  await page.mouse.up();
  await page.waitForTimeout(400);

  const after = await sizeState(page);
  const widgetAfter = await page.locator('#live2d-widget').boundingBox();

  expect(after.cssVar, '拖拽后 --live2d-size 应变大').toBeGreaterThan(before.cssVar);
  expect(after.stored, '拖拽结果应被持久化').toBeGreaterThan(before.stored);
  expect(after.slider, '面板滑块应同步').toBe(after.stored);
  expect(after.label).toBe(`${after.stored}%`);

  // 手柄拖动必须是"缩放"而不是"移动"：不能给看板娘打上自定义位置标记
  const moved = await page.evaluate(() => localStorage.getItem('live2dCustomPosition'));
  expect(moved, '拖手柄不应触发看板娘的拖拽移动').not.toBe('true');
  // 左边缘应保持不动（缩放锚点在左侧），只有宽度变化
  expect(Math.abs(widgetAfter.x - widgetBefore.x)).toBeLessThan(6);
  expect(widgetAfter.width).toBeGreaterThan(widgetBefore.width + 20);
});

test('缩放手柄支持键盘方向键，且尺寸被限制在合法区间', async ({ page }) => {
  await page.goto('/');
  await waitForLive2d(page);
  const p = await bodyPoint(page);
  await page.mouse.click(p.x, p.y);
  await expect(page.locator('#live2d-widget')).toHaveClass(/live2d-settings-open/);

  await page.locator('#live2d-resize-handle').focus();
  const before = await sizeState(page);

  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(250);
  const bigger = await sizeState(page);
  expect(bigger.stored).toBe(Math.min(160, before.stored + 5));

  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(250);
  const smaller = await sizeState(page);
  expect(smaller.stored).toBe(Math.max(60, before.stored - 5));

  // 下限保护：连按到 60% 之下也不应越界
  for (let i = 0; i < 20; i += 1) await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(300);
  const floored = await sizeState(page);
  expect(floored.stored).toBeGreaterThanOrEqual(60);
  expect(floored.cssVar).toBeGreaterThanOrEqual(0.6);
});

test('缩放手柄有可访问名称，并在中英文间切换', async ({ page }) => {
  await page.goto('/');
  await waitForLive2d(page);
  const handle = page.locator('#live2d-resize-handle');
  await expect(handle).toHaveAttribute('aria-label', '调节看板娘大小');
  await page.locator('#language-toggle').click();
  await expect(handle).toHaveAttribute('aria-label', 'Adjust Live2D size');
});

test('滑块、持久化值、实际尺寸三者始终一致（step 必须是 1）', async ({ page }) => {
  /*
   * 既有 bug：`#live2d-size` 的 step 原为 5，而 normalizeLive2dSizePercent 会把尺寸
   * 夹到视口允许的最大值（1280×720 下是 124，不是 5 的倍数）。range 输入会把 value
   * 吸附到步进网格 → 滑块显示 125 而实际尺寸是 124，标签又写 124%。
   * 改成 step=1 后三者（含键盘可达的拖拽手柄）说同一个数。
   */
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  await waitForLive2d(page);
  await expect(page.locator('#live2d-size')).toHaveAttribute('step', '1');

  for (const requested of [120, 140, 160]) {
    await page.evaluate((value) => {
      const input = document.querySelector('#live2d-size');
      input.value = String(value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, requested);
    await page.waitForTimeout(400);
    const s = await sizeState(page);
    expect(s.slider, `请求 ${requested}% 时滑块与实际尺寸不一致`).toBe(s.stored);
    expect(s.cssVar).toBeCloseTo(s.stored / 100, 2);
    expect(s.label).toBe(`${s.stored}%`);
    // 不能超过视口允许的最大值
    const max = await page.evaluate(() => getLive2dMaxScale() * 100);
    expect(s.stored).toBeLessThanOrEqual(Math.ceil(max));
  }
});
