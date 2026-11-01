const { test, expect } = require('@playwright/test');

const markerBox = page => page.locator('.sidebar-selection-indicator').boundingBox();
async function expectAligned(page, horizontal = false) {
  await expect.poll(async () => {
    const marker = await markerBox(page);
    const row = await page.locator('.sidebar-link.active').boundingBox();
    const gap = Math.abs(horizontal
      ? marker.x + marker.width / 2 - row.x - row.width / 2
      : marker.y + marker.height / 2 - row.y - row.height / 2);
    // A stretched marker can cross the target centre before its tail settles.
    return Math.max(gap, Math.abs((horizontal ? marker.width : marker.height) - 16) * 2);
  }).toBeLessThan(1);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('live2dEnabled', 'false'));
  await page.goto('/');
  await expect(page.locator('.sidebar-selection-indicator')).toBeVisible();
});

test('相邻按钮切换先拉长再收拢，连续反向点击停在最后一项', async ({ page }) => {
  await expectAligned(page);
  const start = await markerBox(page);
  await page.evaluate(() => {
    window.sidebarMotionSamples = [];
    document.querySelector('.sidebar-link[href="#about"]').addEventListener('click', () => {
      const until = performance.now() + 400;
      const sample = () => {
        const box = document.querySelector('.sidebar-selection-indicator').getBoundingClientRect();
        sidebarMotionSamples.push({ height: box.height, y: box.y });
        if (performance.now() < until) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    }, { once: true });
  });
  await page.locator('.sidebar-link[href="#about"]').click();
  await expect.poll(() => page.evaluate(() => Math.max(...sidebarMotionSamples.map(box => box.height)))).toBeGreaterThan(22);
  const stretched = await page.evaluate(() => sidebarMotionSamples.find(box => box.height > 22));
  expect(stretched.y).toBeGreaterThanOrEqual(start.y - 1);
  await expectAligned(page);
  await page.locator('.sidebar-link[href="#projects"]').click();
  await page.locator('.sidebar-link[href="#hero"]').click();
  await page.locator('.sidebar-link[href="#about"]').click();
  await expect(page.locator('.sidebar-link[aria-current="location"]')).toHaveAttribute('href', '#about');
  await expectAligned(page);
  await page.locator('#sidebar-toggle').click();
  await expectAligned(page);
  await page.locator('.sidebar-link[href="#projects"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.sidebar-link.active')).toHaveAttribute('href', '#projects');
  await expectAligned(page);
  await page.screenshot({ path: 'artifacts/refinement/sidebar-motion.png' });
});

test('减少动态效果立即定位，不同桌面宽度滚动仍对齐', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1280, 1440, 1536]) {
    await page.setViewportSize({ width, height: 800 });
    await page.locator('.sidebar-link[href="#about"]').click();
    await expectAligned(page);
    await page.locator('.sidebar-link[href="#page-bottom"]').click();
    await expectAligned(page);
    expect(await page.locator('.sidebar-selection-indicator').evaluate(el => parseFloat(getComputedStyle(el).transitionDuration))).toBeLessThan(0.001);
  }
  await page.evaluate(() => {
    clearTimeout(sidebarActiveLockTimer);
    sidebarActiveLockId = null;
    window.scrollTo({ top: document.querySelector('#projects').offsetTop, behavior: 'instant' });
    updateSidebarActive();
  });
  await expect(page.locator('.sidebar-link.active')).toHaveAttribute('href', '#projects');
  await expectAligned(page);
});

test('跨行双向切换保留舒缓的伸展和中间连接阶段', async ({ page }) => {
  for (const theme of ['apple', 'fuwari', 'astropaper', 'rem']) {
    await page.evaluate(theme => applyStyle(theme), theme);
    for (const target of ['page-bottom', 'hero']) {
    await expectAligned(page);
    const motion = await page.evaluate(async target => {
      const marker = document.querySelector('.sidebar-selection-indicator');
      const from = marker.getBoundingClientRect();
      const row = document.querySelector(`.sidebar-link[href="#${target}"]`);
      const to = row.getBoundingClientRect();
      const destination = to.top + (to.height - 16) / 2;
      const distance = Math.abs(destination - from.top);
      const down = destination > from.top;
      const frames = [];
      row.click();
      // Pause the browser's real animation and inspect rendered geometry at
      // fixed times; busy machines can skip entire real-time sampling windows.
      const animation = marker.getAnimations()[0];
      animation.pause();
      for (const time of [0, 75, 125, 155, 250, 350, 365, 390, 410, 440, 470, 500, 540, 580, 600]) {
        animation.currentTime = time;
        await new Promise(requestAnimationFrame);
        const box = marker.getBoundingClientRect();
        frames.push({
          time,
          lead: (down ? box.bottom - from.bottom : from.top - box.top) / distance,
          trail: (down ? box.top - from.top : from.bottom - box.bottom) / distance,
          height: box.height,
        });
      }
      animation.finish();
      return frames;
    }, target);
    const opening = motion.filter(frame => frame.time >= 100 && frame.time <= 160);
    expect(opening.length).toBeGreaterThan(0);
    expect(Math.max(...opening.map(frame => frame.lead)), target).toBeLessThan(0.9);
    // The old row must stay connected until the head actually reaches the
    // new row. Merely stretching to 90% still leaves the connection missing.
    expect(motion.filter(frame => frame.lead < 0.999).every(frame => Math.abs(frame.trail) < 0.005), target).toBe(true);
    const connected = motion.filter(frame => frame.lead >= 0.999 && Math.abs(frame.trail) < 0.005);
    expect(connected.length, target).toBeGreaterThanOrEqual(2);
    expect(connected.at(-1).time - connected[0].time, target).toBeGreaterThanOrEqual(25);
    expect(motion.some(frame => frame.lead >= 0.999 && frame.trail > 0.2 && frame.trail < 0.8), target).toBe(true);
    expect(Math.min(...motion.map(frame => frame.height)), target).toBeGreaterThanOrEqual(15);
    await expectAligned(page);
    }
  }
});

test('向上反向切换时竖线始终可见，双向过渡保留足够的拉伸时间', async ({ page }) => {
  const reverse = await page.evaluate(() => new Promise(resolve => {
    const marker = document.querySelector('.sidebar-selection-indicator');
    const initial = marker.getBoundingClientRect();
    const last = document.querySelector('.sidebar-link[href="#page-bottom"]').getBoundingClientRect();
    const midpoint = (initial.top + last.top + (last.height - 16) / 2) / 2;
    const started = performance.now();
    document.querySelector('.sidebar-link[href="#page-bottom"]').click();
    const waitForTail = () => {
      const rect = marker.getBoundingClientRect();
      if (rect.top < midpoint && performance.now() - started < 1500) {
        requestAnimationFrame(waitForTail);
        return;
      }
      const samples = [], reversedAt = performance.now();
      document.querySelector('.sidebar-link[href="#about"]').click();
      const sample = () => {
        const box = marker.getBoundingClientRect();
        samples.push({ time: performance.now() - reversedAt, height: box.height });
        if (performance.now() - reversedAt < 800) requestAnimationFrame(sample);
        else resolve(samples);
      };
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(waitForTail);
  }));
  expect(Math.min(...reverse.map(frame => frame.height))).toBeGreaterThanOrEqual(15);
  await expectAligned(page);

  for (const target of ['projects', 'about']) {
    const frames = await page.evaluate(target => new Promise(resolve => {
      const marker = document.querySelector('.sidebar-selection-indicator');
      const started = performance.now(), frames = [];
      document.querySelector(`.sidebar-link[href="#${target}"]`).click();
      const sample = () => {
        const box = marker.getBoundingClientRect();
        frames.push({ time: performance.now() - started, height: box.height });
        if (performance.now() - started < 800) requestAnimationFrame(sample);
        else resolve(frames);
      };
      requestAnimationFrame(sample);
    }), target);
    expect(frames.some(frame => frame.time >= 380 && frame.time <= 500 && frame.height > 20), target).toBe(true);
    await expectAligned(page);
  }
});
