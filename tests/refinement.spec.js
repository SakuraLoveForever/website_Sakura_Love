const { test, expect } = require('@playwright/test');

test('光标在角色右侧但屏幕左半边时，眼球仍朝右，拖动后方向也正确', async ({ page }) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForFunction(() => typeof live2dActiveModel !== 'undefined' && live2dActiveModel?.internalModel);
  for (const key of ['tutu', 'mao']) {
    await page.evaluate(key => switchLive2dModel(key), key);
    for (const left of [12, 700]) {
      const point = await page.evaluate(left => {
        setLive2dSizePercent(left === 700 ? 140 : 100);
        live2dWidget.classList.add('live2d-custom-position');
        live2dWidget.style.left = `${left}px`;
        live2dWidget.style.top = '180px';
        live2dWidget.style.bottom = 'auto';
        const rect = live2dWidget.getBoundingClientRect(), metrics = getLive2dMetrics();
        return { x: rect.left + metrics.visualWidth / 2, y: 400 };
      }, left);
      await page.mouse.move(point.x + 90, point.y);
      await expect.poll(() => page.evaluate(() => live2dActiveModel.internalModel.coreModel.getParameterValueById('ParamEyeBallX'))).toBeGreaterThan(0);
      await page.mouse.move(point.x - 90, point.y);
      await expect.poll(() => page.evaluate(() => live2dActiveModel.internalModel.coreModel.getParameterValueById('ParamEyeBallX'))).toBeLessThan(0);
    }
  }
});

test('Mao 首次加载和暂停重绘时只显示一套手臂姿势', async ({ page }) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('live2dModel', 'mao'));
  await page.goto('/');
  await page.waitForFunction(() => typeof live2dActiveModel !== 'undefined' && live2dActiveModel?.internalModel);
  const readArms = () => page.evaluate(() => {
    const core = live2dActiveModel.internalModel.coreModel;
    return ['PartArmLA', 'PartArmLB', 'PartArmRA', 'PartArmRB'].map(id => core.getPartOpacityByIndex(core.getPartIndex(id)));
  });
  expect(await readArms()).toEqual([1, 0, 1, 0]);
  await page.evaluate(() => {
    const core = live2dActiveModel.internalModel.coreModel;
    core.setPartOpacityByIndex(core.getPartIndex('PartArmLB'), 1);
    core.setPartOpacityByIndex(core.getPartIndex('PartArmRB'), 1);
    syncLive2dRuntime();
  });
  expect(await readArms()).toEqual([1, 0, 1, 0]);
});

test('看板娘覆盖侧栏时，点击角色打开切换面板且不导航', async ({ page }) => {
  test.setTimeout(90000);
  await page.goto('/');
  await page.waitForFunction(() => typeof live2dActiveModel !== 'undefined' && live2dActiveModel?.internalModel);
  const point = await page.evaluate(() => {
    live2dWidget.classList.add('live2d-custom-position');
    live2dWidget.style.left = '12px'; live2dWidget.style.top = '120px';
    live2dWidget.style.bottom = 'auto';
    const b = live2dActiveModel.getBounds(), r = live2dCanvas.getBoundingClientRect();
    return { x: r.left + b.x + b.width / 2, y: r.top + b.y + b.height * .7 };
  });
  await page.mouse.click(point.x, point.y);
  await expect(page.locator('#live2d-widget')).toHaveClass(/live2d-settings-open/);
  await expect(page.locator('#live2d-model option')).toHaveCount(5);
  expect(new URL(page.url()).hash).toBe('');
});

test('草莓兔兔动画更新后，送入 Cubism 绘制的水印参数仍为隐藏态', async ({ page }) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('live2dModel', 'tutu'));
  await page.goto('/');
  await page.waitForFunction(() => typeof live2dActiveModel !== 'undefined' && live2dActiveModel?.internalModel);
  const value = await page.evaluate(() => {
    const internal = live2dActiveModel.internalModel, core = internal.coreModel;
    const raw = core._model, update = raw.update.bind(raw);
    let drawnValue;
    raw.update = () => { drawnValue = core.getParameterValueById('Param261'); return update(); };
    const updateMotion = internal.motionManager.update.bind(internal.motionManager);
    internal.motionManager.update = (...args) => {
      const result = updateMotion(...args);
      core.setParameterValueById('Param261', 0);
      return result;
    };
    internal.update(0, performance.now());
    return drawnValue;
  });
  expect(value).toBe(1);
});

test('草莓兔兔实际画布中不再绘制水印文字', async ({ page }) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('live2dModel', 'tutu'));
  await page.goto('/');
  await page.waitForFunction(() => typeof live2dActiveModel !== 'undefined' && live2dActiveModel?.internalModel);
  const result = await page.evaluate(() => {
    const internal = live2dActiveModel.internalModel, core = internal.coreModel;
    const readPixels = () => {
      const gl = live2dApp.renderer.gl;
      const pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
      gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      return pixels;
    };
    const render = (value) => {
      core.setParameterValueById('Param261', value);
      // Bypass the visibility guard only to obtain the watermark's pixel mask.
      core._model.update();
      PIXI.Renderer.prototype.render.call(live2dApp.renderer, live2dApp.stage);
      return readPixels();
    };
    const dirty = render(0), clean = render(1), mask = [];
    for (let i = 3; i < dirty.length; i += 4) {
      if (dirty[i] > 128 && clean[i] < 16) mask.push(i);
    }
    const updateMotion = internal.motionManager.update.bind(internal.motionManager);
    internal.motionManager.update = (...args) => {
      const result = updateMotion(...args); core.setParameterValueById('Param261', 0); return result;
    };
    internal.update(0, performance.now());
    live2dApp.renderer.render(live2dApp.stage);
    const actual = readPixels();
    core.setParameterValueById('Param261', 0);
    core._model.update();
    live2dApp.renderer.render(live2dApp.stage);
    const paused = readPixels();
    return { mask: mask.length, remaining: mask.filter(i => actual[i] > 128).length,
      remainingPaused: mask.filter(i => paused[i] > 128).length };
  });
  expect(result.mask).toBeGreaterThan(100);
  expect(result.remaining).toBeLessThan(result.mask * .1);
  expect(result.remainingPaused).toBeLessThan(result.mask * .1);
});

test('桌面侧栏和收起的音乐区保持紧凑', async ({ page }) => {
  await page.goto('/');
  const sizes = await page.evaluate(() => ({
    sidebar: document.querySelector('.side-nav').getBoundingClientRect().width,
    music: document.querySelector('#music-library').getBoundingClientRect().height,
  }));
  expect(sizes.sidebar).toBeLessThanOrEqual(210);
  expect(sizes.music).toBeLessThanOrEqual(120);
});

test('光标方向实际送入眼球绘制，暂停动画时也会更新画布', async ({ page }) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForFunction(() => typeof live2dActiveModel !== 'undefined' && live2dActiveModel?.internalModel);
  await page.evaluate(() => {
    const core=live2dActiveModel.internalModel.coreModel, update=core._model.update.bind(core._model);
    window.__drawnEye=null;
    core._model.update=()=>{window.__drawnEye={x:core.getParameterValueById('ParamEyeBallX'),y:core.getParameterValueById('ParamEyeBallY')};return update();};
  });
  await page.mouse.move(40,40);
  await expect.poll(() => page.evaluate(() => window.__drawnEye?.x)).toBeLessThan(-.5);
  await expect.poll(() => page.evaluate(() => window.__drawnEye?.y)).toBeGreaterThan(.5);
  await page.mouse.move(1240,760);
  await expect.poll(() => page.evaluate(() => window.__drawnEye?.x)).toBeGreaterThan(.5);
  await expect.poll(() => page.evaluate(() => window.__drawnEye?.y)).toBeLessThan(-.5);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.mouse.move(40,400);
  await expect.poll(() => page.evaluate(() => window.__drawnEye?.x)).toBeLessThan(-.5);
  await page.mouse.move(1240,400);
  await expect.poll(() => page.evaluate(() => window.__drawnEye?.x)).toBeGreaterThan(.5);
});

test('连续筛选的动效不残留透明卡片，减少动画时直接呈现结果', async ({ page }) => {
  await page.goto('/');
  await page.locator('#projects').scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    for (const filter of ['web','tools','browser','all']) document.querySelector(`[data-project-filter="${filter}"]`).click();
  });
  await expect(page.locator('#projects .card:not([hidden])')).toHaveCount(12);
  await expect(page.locator('#projects .card-body').first()).toHaveCSS('opacity','1');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => { window.__motionCalls=0; Motion.animate=()=>{window.__motionCalls++;}; });
  await page.locator('[data-project-filter="web"]').click();
  expect(await page.evaluate(() => window.__motionCalls)).toBe(0);
  await expect(page.locator('#projects .card:not([hidden])')).toHaveCount(4);
});
