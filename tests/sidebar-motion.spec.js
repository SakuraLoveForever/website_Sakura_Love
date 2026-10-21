const { test, expect } = require('@playwright/test');

const markerBox = page => page.locator('.sidebar-selection-indicator').boundingBox();
async function expectAligned(page, horizontal = false) {
  await expect.poll(async () => {
    const marker = await markerBox(page);
    const row = await page.locator('.sidebar-link.active').boundingBox();
    return Math.abs(horizontal
      ? marker.x + marker.width / 2 - row.x - row.width / 2
      : marker.y + marker.height / 2 - row.y - row.height / 2);
  }).toBeLessThan(1);
  const box = await markerBox(page);
  expect(horizontal ? box.width : box.height).toBeCloseTo(16, 0);
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

test('减少动态效果立即定位，手机换行与桌面滚动仍对齐', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [390, 354, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await page.locator('.sidebar-link[href="#about"]').click();
    await expectAligned(page, width <= 833);
    await page.locator('.sidebar-link[href="#page-bottom"]').click();
    await expectAligned(page, width <= 833);
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
