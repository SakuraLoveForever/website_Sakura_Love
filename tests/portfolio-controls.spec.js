const { test, expect } = require('@playwright/test');

test('分类只显示匹配的项目，语言切换保留筛选，全部恢复十二个项目', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('#projects .card:visible');
  await expect(cards).toHaveCount(12);
  await page.locator('[data-project-filter="browser"]').click();
  await expect(cards).toHaveCount(2);
  await expect(cards.first()).toContainText('tab-sync');
  await page.locator('#language-toggle').click();
  await expect(page.locator('[data-project-filter="browser"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(cards).toHaveCount(2);
  await expect(page.locator('#project-result-count')).toContainText('2');
  await page.locator('[data-project-filter="all"]').click();
  await expect(cards).toHaveCount(12);
  await expect(page.locator('#projects .card-cover img')).toHaveCount(11);
  await page.locator('#projects .card-cover img').evaluateAll(imgs => imgs.forEach(img => img.loading = 'eager'));
  await expect.poll(() => page.locator('#projects .card-cover img').evaluateAll(imgs => imgs.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
});

test('项目布局在手机、平板和桌面没有溢出，桌面展示保持紧凑', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [354, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/#projects');
    const result = await page.locator('#projects .project-grid').evaluate(grid => {
      const outer = grid.getBoundingClientRect();
      return { height: outer.height, cards: [...grid.querySelectorAll('.card')].map(card => {
        const r = card.getBoundingClientRect();
        return r.width > 100 && r.left >= outer.left - 1 && r.right <= outer.right + 1;
      }) };
    });
    expect(result.cards.every(Boolean), `${width}px 项目卡片溢出`).toBe(true);
    if (width === 1440) expect(result.height).toBeLessThan(1700);
  }
});

test('看板娘面板可切换角色和调整大小，并保持在视口内', async ({ page }) => {
  test.setTimeout(90000);
  await page.addInitScript(() => localStorage.setItem('live2dModel', 'hiyori'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForFunction(() => typeof live2dActiveModel !== 'undefined' && live2dActiveModel?.internalModel, null, { timeout: 60000 });
  await page.evaluate(() => setLive2dSettingsOpen(true));
  const panel = page.locator('#live2d-settings-panel');
  await expect(panel).not.toHaveAttribute('inert', '');
  const b = await panel.boundingBox();
  expect(b.x).toBeGreaterThanOrEqual(8);
  expect(b.x + b.width).toBeLessThanOrEqual(1272);
  expect(b.y + b.height).toBeLessThanOrEqual(792);
  await page.locator('#live2d-next-model').click();
  await expect(page.locator('#live2d-model')).toHaveValue('haru');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('live2dModel'))).toBe('haru');
  await page.locator('[data-live2d-size-step="-10"]').focus();
  await page.keyboard.press('Enter');
  expect(await page.locator('#live2d-size').inputValue()).toBe('90');
  await expect.poll(async () => (await panel.boundingBox()).y + (await panel.boundingBox()).height).toBeLessThanOrEqual(792);
  await page.locator('#live2d-settings-close').click();
  await expect(panel).toHaveAttribute('inert', '');
  await page.evaluate(() => setLive2dSettingsOpen(true));
  await page.keyboard.press('Escape');
  await expect(page.locator('#live2d-settings-toggle')).toHaveAttribute('aria-expanded', 'false');
  // With a custom position near the viewport edge, the panel must still fit.
  await page.evaluate(() => {
    localStorage.setItem('live2dCustomPosition', 'true');
    localStorage.setItem('live2dX', '8');
    localStorage.setItem('live2dY', '8');
    applyLive2dSettings();
    setLive2dSettingsOpen(true);
  });
  const moved = await panel.boundingBox();
  expect(moved.x).toBeGreaterThanOrEqual(8);
  expect(moved.x + moved.width).toBeLessThanOrEqual(1272);
});
