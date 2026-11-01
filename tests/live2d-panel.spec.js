const { test, expect } = require('@playwright/test');
const fs = require('node:fs');

test('移除爱姬多娜并回退旧角色偏好', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('live2dModel', 'echidna'));
  await page.goto('/');
  await expect(page.locator('#live2d-model option[value="echidna"]')).toHaveCount(0);
  expect(await page.evaluate(() => getLive2dModelKey('echidna'))).toBe('tutu');
  expect(await page.evaluate(() => Object.hasOwn(live2dModels, 'echidna'))).toBe(false);
  expect(JSON.parse(fs.readFileSync('assets/live2d/rezero/SOURCE.json', 'utf8')).directories.echidna).toBeUndefined();
});

for (const deviceScaleFactor of [1, 2]) {
test.describe(`DPR ${deviceScaleFactor}`, () => {
test.use({ deviceScaleFactor });
test('左键只显示语录，右键立即展开面板，透明区域仍可穿透', async ({ page }) => {
  test.setTimeout(90000);
  await page.addInitScript(() => localStorage.setItem('live2dModel', 'rem'));
  await page.goto('/');
  await page.waitForFunction(() => typeof live2dActiveModel !== 'undefined' && live2dActiveModel?.internalModel);
  // Pause only the renderer so hit coordinates cannot move between sampling and clicking.
  // Keep normal motion preferences to test the real panel animation path.
  await page.evaluate(() => live2dApp.stop());
  const result = await page.evaluate(() => {
    const canvas = live2dCanvas, rect = canvas.getBoundingClientRect();
    const copy = document.createElement('canvas'); copy.width = canvas.width; copy.height = canvas.height;
    const context = copy.getContext('2d'); context.drawImage(canvas, 0, 0);
    const pixels = context.getImageData(0, 0, copy.width, copy.height).data;
    const find = opaque => {
      for (let y = 8; y < rect.height - 8; y += 8) for (let x = 8; x < rect.width - 8; x += 8) {
        const alpha = pixels[(Math.floor(y / rect.height * copy.height) * copy.width + Math.floor(x / rect.width * copy.width)) * 4 + 3];
        if (opaque ? alpha < 200 : alpha > 0) continue;
        const clientX = rect.left + x, clientY = rect.top + y;
        const target = document.elementFromPoint(clientX, clientY);
        if (!target || target.closest('a,button,input,select,summary')) continue;
        return { target, clientX, clientY };
      }
      throw new Error('No suitable hit point');
    };
    const opaque = find(true), transparent = find(false), reads = [];
    const extract = live2dApp.renderer.extract;
    let fullExtractions = 0;
    const originalExtract = extract.pixels.bind(extract);
    extract.pixels = (...args) => { fullExtractions++; return originalExtract(...args); };
    const gl = live2dApp.renderer.gl, originalRead = gl.readPixels.bind(gl);
    gl.readPixels = (...args) => { reads.push({width: args[2], height: args[3]}); return originalRead(...args); };
    const click = point => {
      const event = new MouseEvent('click', { bubbles: true, cancelable: true, clientX: point.clientX, clientY: point.clientY });
      point.target.dispatchEvent(event); return event.defaultPrevented;
    };
    const started = performance.now(); const prevented = click(opaque); const handlerMs = performance.now() - started;
    const leftOpened = live2dWidget.classList.contains('live2d-settings-open');
    const quoteBeforeRight = live2dDialog.textContent;
    const contextmenu = point => {
      const event = new MouseEvent('contextmenu', { button: 2, bubbles: true, cancelable: true, clientX: point.clientX, clientY: point.clientY });
      point.target.dispatchEvent(event); return event.defaultPrevented;
    };
    const rightPrevented = contextmenu(opaque);
    const rightPreservedQuote = live2dDialog.textContent === quoteBeforeRight;
    const style = getComputedStyle(live2dSettingsPanel);
    const opened = live2dWidget.classList.contains('live2d-settings-open');
    const visibleImmediately = style.opacity === '1' && style.visibility === 'visible';
    const blur = style.backdropFilter, animations = live2dSettingsPanel.getAnimations().length;
    const quoteCharacter = live2dDialog.dataset.quoteCharacter;
    const quoteMatchesCharacter = window.live2dCharacterQuotes.characters.rem.quotes.some(quote => quote.text === live2dDialog.textContent);
    setLive2dSettingsOpen(false);
    const transparentPrevented = click(transparent);
    const transparentRightPrevented = contextmenu(transparent);
    return { leftOpened, rightPrevented, rightPreservedQuote, transparentRightPrevented, fullExtractions, reads, handlerMs, prevented, opened, visibleImmediately, blur, animations, quoteCharacter, quoteMatchesCharacter,
      transparentPrevented, transparentOpened: live2dWidget.classList.contains('live2d-settings-open') };
  });
  expect(result.fullExtractions).toBe(0);
  expect(result.reads.length).toBeGreaterThan(0);
  expect(result.reads.every(read => read.width === 1 && read.height === 1)).toBe(true);
  expect(result.leftOpened).toBe(false);
  expect(result.rightPrevented).toBe(true);
  expect(result.rightPreservedQuote).toBe(true);
  expect(result.transparentRightPrevented).toBe(false);
  expect(result.opened).toBe(true);
  expect(result.prevented).toBe(true);
  expect(result.visibleImmediately).toBe(true);
  expect(result.blur).toBe('none');
  expect(result.animations).toBe(0);
  expect(result.quoteCharacter).toBe('rem');
  expect(result.quoteMatchesCharacter).toBe(true);
  expect(result.transparentPrevented).toBe(false);
  expect(result.transparentOpened).toBe(false);
  console.log('Panel click handler:', result.handlerMs.toFixed(1), 'ms');
});
});
}
