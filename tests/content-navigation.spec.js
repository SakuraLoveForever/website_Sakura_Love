const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('live2dEnabled', 'false'));
  await page.goto('/');
});

const targetGap = (page, id) => page.evaluate(id => {
  const el = document.getElementById(id);
  const top = el.getBoundingClientRect().top;
  const wanted = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  return Math.abs(top - wanted);
}, id);

test('导航连续滚动时内容坐标稳定，停止后不再整块位移或淡入', async ({ page }) => {
  await page.evaluate(() => {
    window.navigationFrames = [];
    const end = performance.now() + 1200;
    const record = () => {
      const section = document.querySelector('#projects');
      navigationFrames.push({ time: performance.now(), y: scrollY, documentTop: section.getBoundingClientRect().top + scrollY, opacity: getComputedStyle(section).opacity });
      if (performance.now() < end) requestAnimationFrame(record);
    };
    document.querySelector('.sidebar-link[href="#projects"]').addEventListener('click', record, { once: true });
  });
  await page.locator('.sidebar-link[href="#projects"]').click();
  await expect.poll(() => targetGap(page, 'projects')).toBeLessThan(2);
  await expect(page.locator('.section-glow-ring, .flash-highlight')).toHaveCount(0);
  await page.waitForTimeout(400);
  const samples = await page.evaluate(() => navigationFrames);
  const last = samples.at(-1).y;
  expect(samples.filter(frame => frame.y > 5 && frame.y < last - 5).length).toBeGreaterThan(5);
  const positions = samples.map(frame => frame.documentTop);
  expect(Math.max(...positions) - Math.min(...positions)).toBeLessThan(1.5);
  expect(samples.every(frame => Number(frame.opacity) === 1)).toBe(true);
});

test('连续点击只到最后目标，滚轮会中断自动导航', async ({ page }) => {
  await page.locator('.sidebar-link[href="#page-bottom"]').click();
  await page.locator('.sidebar-link[href="#about"]').click();
  await expect.poll(() => targetGap(page, 'about')).toBeLessThan(2);
  await expect(page).toHaveURL(/#about$/);
  await page.locator('.sidebar-link[href="#page-bottom"]').click();
  await page.mouse.move(900, 450);
  await page.mouse.wheel(0, -120);
  await page.waitForTimeout(650);
  const stopped = await page.evaluate(() => scrollY);
  await page.waitForTimeout(200);
  expect(Math.abs(await page.evaluate(() => scrollY) - stopped)).toBeLessThan(2);
  expect(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight - scrollY)).toBeGreaterThan(200);
});

test('减少动态效果关闭额外入场，手机和后退导航保持正确位置', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [390, 1024, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await page.locator('.sidebar-link[href="#projects"]').click();
    await expect.poll(() => targetGap(page, 'projects')).toBeLessThan(2);
    expect(await page.locator('#projects').evaluate(el => el.getAnimations().filter(animation => animation.effect.getTiming().duration > 1).length)).toBe(0);
    await page.locator('.sidebar-link[href="#about"]').click();
    await expect.poll(() => targetGap(page, 'about')).toBeLessThan(2);
    await page.goBack();
    await expect(page).toHaveURL(/#projects$/);
    await expect.poll(() => targetGap(page, 'projects')).toBeLessThan(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  }
});

test('用户明确要求的侧栏滚动在系统减少动态效果时仍有连续中间帧', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => {
    window.reducedScrollFrames = [];
    document.querySelector('.sidebar-link[href="#projects"]').addEventListener('click', () => {
      const started = performance.now();
      const sample = () => {
        reducedScrollFrames.push(scrollY);
        if (performance.now() - started < 700) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    }, { once: true });
  });
  await page.locator('.sidebar-link[href="#projects"]').click();
  await page.waitForTimeout(750);
  const frames = await page.evaluate(() => reducedScrollFrames);
  expect(frames.filter(y => y > 5 && y < frames.at(-1) - 5).length).toBeGreaterThan(5);
  await expect.poll(() => targetGap(page, 'projects')).toBeLessThan(2);
});

test('窄桌面默认收起侧栏，手动展开偏好在缩放后保留', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1024, height: 800 });
  await expect(page.locator('body')).toHaveClass(/sidebar-collapsed/);
  await expect(page.locator('#sidebar-toggle')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#sidebar-toggle').click();
  await expect(page.locator('body')).not.toHaveClass(/sidebar-collapsed/);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.setViewportSize({ width: 1024, height: 800 });
  await expect(page.locator('body')).not.toHaveClass(/sidebar-collapsed/);
});

test('音乐区收起且受页面底部限制时，导航结束后仍选中音乐', async ({ page }) => {
  for (const reducedMotion of ['no-preference', 'reduce']) {
    await page.emulateMedia({ reducedMotion });
    await page.locator('.sidebar-link[href="#hero"]').click();
    await page.locator('.sidebar-link[href="#music-library"]').click();
    // Wait beyond the navigation lock and entrance; the old bug appeared here.
    await page.waitForTimeout(1000);
    await expect(page.locator('.sidebar-link.active')).toHaveAttribute('href', '#music-library');
    await expect(page.locator('.sidebar-link[aria-current="location"]')).toHaveAttribute('href', '#music-library');
    await expect(page.locator('#music-library')).toBeInViewport();
    await expect(page.locator('.music-library-details')).not.toHaveAttribute('open');
    await page.mouse.move(900, 450);
    await page.mouse.wheel(0, -700);
    await expect(page.locator('.sidebar-link.active')).toHaveAttribute('href', '#projects');
  }
});
