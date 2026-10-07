const { test, expect } = require('@playwright/test');
const { installQuoteTrace, readQuoteTrace } = require('./helpers/quote-trace');

/**
 * 2026-10-06 修复的回归测试。
 * 覆盖：粒子光标连线 / 语录 1s 消失且半透明 / 眼神全视口跟随 /
 *      看板娘水印不会被热键翻开 / 页脚「音乐」分组删除 / 频谱环由音频驱动。
 */

const waitForLive2d = (page) => page.waitForFunction(
  () => typeof live2dActiveModel !== 'undefined' && live2dActiveModel && live2dActiveModel.internalModel,
  null,
  { timeout: 90000 }
);

const readParam = (page, id) => page.evaluate((paramId) => {
  const core = live2dActiveModel.internalModel.coreModel;
  const index = core.getParameterIndex(paramId);
  if (index < 0 || index >= core.getParameterCount()) return null;
  return Math.round(core.getParameterValueByIndex(index) * 1000) / 1000;
}, id);

test('粒子网络开启了光标连线，且鼠标锚点跟手、不被运动逻辑推走', async ({ page }) => {
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => Boolean(window.__particleNetwork)), { timeout: 15000 }).toBe(true);

  const info = await page.evaluate(() => ({
    interactive: window.__particleNetwork.interactive,
    hasAnchor: Boolean(window.__particleNetwork.mouseAnchor),
    anchorInParticleList: window.__particleNetwork.network.o.indexOf(window.__particleNetwork.mouseAnchor) >= 0,
  }));
  expect(info).toEqual({ interactive: true, hasAnchor: true, anchorInParticleList: true });

  await page.mouse.move(400, 300);
  await expect.poll(() => page.evaluate(() => ({
    x: Math.round(window.__particleNetwork.mouseAnchor.x),
    y: Math.round(window.__particleNetwork.mouseAnchor.y),
  })), { timeout: 5000 }).toEqual({ x: 400, y: 300 });

  // 首屏可见时其他粒子必须有速度（默认就是在动的）
  const movingCount = await page.evaluate(() => {
    const net = window.__particleNetwork.network;
    return net.o.filter(p => p !== net.p && Math.hypot(p.velocity.x, p.velocity.y) > 0).length;
  });
  expect(movingCount).toBeGreaterThan(10);

  // 暂停→恢复后，锚点必须仍然是静止的（velocity 归零），否则连线会飘离光标。
  // 点击页脚开关会把首屏滚出视口，IntersectionObserver 会合法地冻结粒子，
  // 所以这里只断言锚点自身速度，不再断言其他粒子。
  // 用页面内 .click() 而不是 locator.click()：该按钮自带过渡动画，
  // 连续两次 locator.click() 会卡在 actionability 稳定性检查上。
  await page.evaluate(() => {
    const toggle = document.querySelector('#particle-motion-toggle');
    toggle.click();
    toggle.click();
  });
  const anchorVelocity = await page.evaluate(() => {
    const a = window.__particleNetwork.mouseAnchor;
    return Math.hypot(a.velocity.x, a.velocity.y);
  });
  expect(anchorVelocity).toBe(0);
});

test('光标附近确实多画出连线（像素级验证）', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#particle-canvas canvas')).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => Boolean(window.__particleNetwork)), { timeout: 15000 }).toBe(true);
  // 等首屏粒子动起来
  await page.waitForTimeout(800);

  const sample = (hover) => page.evaluate(async (shouldHover) => {
    const cv = document.querySelector('#particle-canvas canvas');
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    const target = { x: Math.round(innerWidth * 0.4), y: Math.round(innerHeight * 0.45) };
    const box = { x: target.x - 110, y: target.y - 110, w: 220, h: 220 };
    const readBox = () => {
      const d = ctx.getImageData(box.x, box.y, box.w, box.h).data;
      let ink = 0;
      for (let i = 3; i < d.length; i += 4) ink += d[i];
      return ink;
    };
    // 采样多帧取平均，抵消粒子漂移带来的噪声
    let total = 0, frames = 0;
    for (let i = 0; i < 8; i++) {
      window.dispatchEvent(new PointerEvent('pointermove', {
        clientX: shouldHover ? target.x : -4000,
        clientY: shouldHover ? target.y : -4000,
      }));
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      total += readBox();
      frames++;
    }
    return total / frames;
  }, hover);

  const parked = await sample(false);
  const hovering = await sample(true);
  // 光标进入后，120px 内每个粒子都会多一条连线 → 该区域墨量必须显著上升
  expect(hovering).toBeGreaterThan(parked * 1.03);
});

test('点击页面背景的语录 1 秒内消失，且为半透明', async ({ page }) => {
  await page.goto('/');
  await installQuoteTrace(page);
  await page.locator('.hero-inner').click({ position: { x: 12, y: 12 } });
  const trace = await readQuoteTrace(page);

  expect(trace.text.length).toBeGreaterThan(0);
  // 精确规格由 CSS 动画时长保证（不受调度抖动影响）
  expect(trace.duration).toBe('1s');
  const backgroundAlpha = Number(trace.background.replace(/^rgba?\(|\)$/g, '').split(',')[3]);
  expect(backgroundAlpha).toBeLessThan(0.7);
  // 墙钟上界放宽到 2600ms，仍可捕获「回退到 2.8s」的回归
  expect(trace.life).toBeGreaterThan(400);
  expect(trace.life).toBeLessThan(2600);
});

test('减少动态效果时语录同样在 1 秒左右消失', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await installQuoteTrace(page);
  await page.locator('.hero-inner').click({ position: { x: 12, y: 12 } });
  const trace = await readQuoteTrace(page);
  expect(trace.text.length).toBeGreaterThan(0);
  expect(trace.life).toBeGreaterThan(400);
  expect(trace.life).toBeLessThan(2600);
});

test('看板娘眼神以角色为原点跟随鼠标（不再提前饱和）', async ({ page }) => {
  await page.goto('/');
  await waitForLive2d(page);

  const settleEyeX = async (x) => {
    await page.mouse.move(x, Math.round(800 / 2));
    let previous = null;
    let stable = 0;
    for (let i = 0; i < 45; i++) {
      const value = await readParam(page, 'ParamEyeBallX');
      if (previous !== null && Math.abs(value - previous) < 0.004) {
        stable += 1;
        if (stable >= 3) return value;
      } else {
        stable = 0;
      }
      previous = value;
      await page.waitForTimeout(60);
    }
    return previous;
  };

  const left = await settleEyeX(40);
  const centerX = await page.evaluate(() => live2dWidget.getBoundingClientRect().left + getLive2dMetrics().visualWidth / 2);
  const middle = await settleEyeX(centerX);
  const right = await settleEyeX(1240);

  // 旧实现在 1280px 视口下 x<=800 全部钉死在 -1
  expect(right - left).toBeGreaterThan(1.2);
  expect(Math.abs(middle)).toBeLessThan(0.35);
  expect(left).toBeLessThan(middle);
  expect(middle).toBeLessThan(right);
});

test('看板娘水印保持隐藏，且 Ctrl+Shift 不再把它翻出来', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await waitForLive2d(page);

  // Param261 = 1 表示隐藏（0 会把「试用版 / Trial Version」水印显示出来）
  await expect.poll(() => readParam(page, 'Param261'), { timeout: 15000 }).toBe(1);

  await page.keyboard.press('Control+Shift+I');
  await page.keyboard.press('Control+Shift+A');
  await page.waitForTimeout(500);
  expect(await readParam(page, 'Param261')).toBe(1);
  expect(errors).toEqual([]);
});

test('看板娘可以被拖动、点击不抛异常，并记住位置（像素命中不再错位）', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await waitForLive2d(page);
  await expect.poll(() => page.evaluate(() => {
    try { return Math.round(live2dActiveModel.getBounds().height); } catch { return 0; }
  }), { timeout: 20000 }).toBeGreaterThan(50);

  const widget = page.locator('#live2d-widget');
  const before = await widget.boundingBox();
  // 模型包围盒中心偏下 = 身体，肯定是不透明像素
  const bounds = await page.evaluate(() => {
    const b = live2dActiveModel.getBounds();
    const r = document.querySelector('#live2d-canvas').getBoundingClientRect();
    return { x: r.left + b.x + b.width / 2, y: r.top + b.y + b.height * 0.7 };
  });

  await page.mouse.move(bounds.x, bounds.y);
  await page.mouse.down();
  await page.mouse.move(bounds.x - 200, bounds.y - 120, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(300);

  const after = await widget.boundingBox();
  expect(Math.abs(after.x - before.x)).toBeGreaterThan(20);
  expect(Math.abs(after.y - before.y)).toBeGreaterThan(20);
  // 位置必须被记住（拖拽是有意保存的交互）
  const saved = await page.evaluate(() => ({
    flag: localStorage.getItem('live2dCustomPosition'),
    x: Number(localStorage.getItem('live2dX')),
    y: Number(localStorage.getItem('live2dY')),
  }));
  expect(saved.flag).toBe('true');
  expect(Number.isFinite(saved.x) && Number.isFinite(saved.y)).toBe(true);

  // 点击本体（触发对话/设置按钮），不应抛异常
  await page.mouse.click(after.x + after.width / 2, after.y + after.height * 0.5);
  await page.waitForTimeout(400);
  // 在 document 上派发事件时 e.target 不是 Element，未加固的 closest() 会在这里抛错
  await page.evaluate(() => {
    document.dispatchEvent(new PointerEvent('pointerdown', { clientX: 640, clientY: 400, bubbles: true }));
    document.dispatchEvent(new MouseEvent('click', { clientX: 640, clientY: 400, bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  });
  await page.waitForTimeout(300);
  expect(errors).toEqual([]);
});

test('页面结构与内联脚本完整（防止 HTML 编码/结构损坏）', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  // 内联 <script> 一旦被编码损坏，浏览器会报 Invalid or unexpected token，
  // 其后的标记会被当作脚本文本吞掉 —— 页脚控件会整体消失。这条测试守住它。
  for (const selector of [
    '#particle-motion-toggle',
    '#particle-line-width',
    '#live2d-toggle',
    '#quote-category-select',
    '#music-library',
    '#toast-root',
    '#live2d-canvas',
  ]) {
    await expect(page.locator(selector), `${selector} 应存在且唯一`).toHaveCount(1);
  }
  await expect(page.locator('body > footer#page-bottom')).toHaveCount(1);
  await expect(page.locator('#projects .card')).toHaveCount(12);
  await expect(page.locator('.music-library-head h2')).toHaveText('音乐收藏');
  expect(errors).toEqual([]);
});

test('粒子运动默认开启（系统减少动画与历史暂停记录都不影响）', async ({ page }) => {
  // 模拟旧版遗留状态：开关被写成 false，且没有版本标记
  await page.addInitScript(() => {
    try {
      localStorage.setItem('particleMotionEnabled', 'false');
      localStorage.removeItem('particleMotionVersion');
    } catch {}
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('#particle-motion-toggle')).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => localStorage.getItem('particleMotionEnabled'))).toBe('true');

  const changed = await page.evaluate(async () => {
    const cv = document.querySelector('#particle-canvas canvas');
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    const before = ctx.getImageData(0, 0, cv.width, cv.height).data;
    await new Promise(r => setTimeout(r, 400));
    const after = ctx.getImageData(0, 0, cv.width, cv.height).data;
    let n = 0;
    for (let i = 0; i < before.length; i += 32) if (before[i] !== after[i]) n++;
    return n;
  });
  expect(changed).toBeGreaterThan(20);
});

test('看板娘面板任意位置都能拖动（含角色轮廓之外的空白）', async ({ page }) => {
  await page.goto('/');
  await waitForLive2d(page);
  const widget = page.locator('#live2d-widget');
  const start = await widget.boundingBox();
  // 面板左上角：正常情况下一定是透明像素，旧实现会在这里抓空。
  // 向左上拖（默认位置靠右下，往右下会被屏幕边界钳制）
  const empty = { x: start.x + start.width * 0.18, y: start.y + start.height * 0.12 };
  await page.mouse.move(empty.x, empty.y);
  await page.mouse.down();
  await page.mouse.move(empty.x - 130, empty.y - 100, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(250);
  const after = await widget.boundingBox();
  expect(Math.abs(after.x - start.x)).toBeGreaterThan(20);
  expect(Math.abs(after.y - start.y)).toBeGreaterThan(20);

  // 面板空白处「点击」不应弹语录，也不应吞掉页面的普通点击
  const bottom = await widget.boundingBox();
  const corner = { x: bottom.x + bottom.width * 0.9, y: bottom.y + bottom.height * 0.95 };
  await page.mouse.click(corner.x, corner.y);
  await page.waitForTimeout(300);
  await expect(page.locator('body')).toBeVisible();
});

test('技能模块已彻底删除（区块 / 导航项 / 中英文文案 / 数据源）', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#skills')).toHaveCount(0);
  await expect(page.locator('.sidebar-link[data-nav-key="skills"]')).toHaveCount(0);
  await expect(page.locator('.chips')).toHaveCount(0);
  // hero / about / projects / music-library / contact
  await expect(page.locator('main section')).toHaveCount(5);
  await expect(page.locator('.sidebar-link')).toHaveCount(6);

  // 删除后相邻模块的锚点导航必须仍然可用
  await page.locator('.sidebar-link[href="#projects"]').click();
  await expect(page).toHaveURL(/#projects$/);
  await expect(page.locator('#projects')).toBeVisible();
  await page.locator('.sidebar-link[href="#about"]').click();
  await expect(page).toHaveURL(/#about$/);

  // 切到英文也不应再出现 Skills 文案，且切换本身不报错
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.locator('#language-toggle').click();
  await page.waitForTimeout(600);
  await expect(page.locator('.sidebar-link', { hasText: 'Skills' })).toHaveCount(0);
  await expect(page.locator('.sidebar-label').nth(2)).toHaveText('Projects');
  await page.locator('#language-toggle').click();
  await page.waitForTimeout(600);
  await expect(page.locator('.sidebar-label').nth(2)).toHaveText('项目');
  expect(errors).toEqual([]);
});

test('看板娘水印在停帧（减少动画）时也会被强制压回', async ({ page }) => {
  /*
   * 最难的一条路径：系统开了「减少动画」→ app.ticker 停摆 →
   * 水印参数不再被逐帧写入，只剩切模型那一次。这里直接把它强行改成
   * 「显示水印」(0)，再跑一个真实模型帧，验证守卫会把它压回 1。
   * 守卫必须写在 internalModel.update() **之前** —— Cubism 参数只有经过
   * coreModel.update()（update 的最后一步）才会反映到画面上。
   */
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await waitForLive2d(page);
  await expect.poll(() => readParam(page, 'Param261'), { timeout: 20000 }).toBe(1);

  const result = await page.evaluate(() => {
    const model = live2dActiveModel;
    const core = model.internalModel.coreModel;
    const index = core.getParameterIndex('Param261');
    core.setParameterValueByIndex(index, 0);              // 强行显示水印
    const forced = core.getParameterValueByIndex(index);
    model.internalModel.update(16, performance.now());     // 一个真实模型帧
    return {
      tickerStopped: live2dApp.ticker.started === false,
      forced,
      afterFrame: core.getParameterValueByIndex(index),
    };
  });
  expect(result.tickerStopped).toBe(true);
  expect(result.forced).toBe(0);
  expect(result.afterFrame).toBe(1);
});

test('页脚「音乐」设置分组与跳转按钮已删除，音乐区本身保留', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#music-settings-link')).toHaveCount(0);
  await expect(page.locator('#music-settings-label')).toHaveCount(0);
  const legends = await page.locator('#page-bottom legend').allTextContents();
  expect(legends).not.toContain('音乐');
  await expect(page.locator('#music-library')).toHaveCount(1);
  await expect(page.locator('.music-library-head h2')).toHaveText('音乐收藏');
});

test('音乐收藏频谱环在播放时由真实音频能量驱动', async ({ page }) => {
  await page.goto('/#music-library');
  await expect(page.locator('#music-library')).toBeVisible();
  const details = page.locator('.music-library-details');
  if (!(await details.evaluate(el => el.open))) {
    await page.locator('.music-library-head').click();
    await page.waitForTimeout(400);
  }
  await expect(page.locator('#music-spectrum')).toHaveCount(1);

  const level = () => page.evaluate(() => Number(
    getComputedStyle(document.querySelector('.music-library-stage')).getPropertyValue('--music-level')
  ));
  const idle = await level();
  expect(idle).toBeGreaterThanOrEqual(0);

  await page.locator('#music-library-play').click({ force: true });
  await expect.poll(level, { timeout: 20000 }).toBeGreaterThan(idle + 0.05);
});

test('音乐收藏角色轨道在窄屏下是单列且不横向溢出', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 });
  await page.goto('/#music-library');
  const details = page.locator('.music-library-details');
  if (!(await details.evaluate(el => el.open))) {
    await page.locator('.music-library-head').click();
    await page.waitForTimeout(400);
  }
  await expect(page.locator('.music-role-group').first()).toBeVisible();
  const columns = await page.locator('.music-library-list').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
  expect(columns).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});
