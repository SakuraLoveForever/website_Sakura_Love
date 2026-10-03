const { test, expect } = require('@playwright/test');

test.describe('首页', () => {
  test('首次访问使用 Upscayl 风格并可切换回来', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toHaveClass(/design-upscayl/);
    await expect(page.locator('[data-design-style="upscayl"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('.hero-actions .btn.primary').focus();
    await expect(page.locator('.hero-actions .btn.primary')).toHaveCSS('outline-style', 'solid');
    await page.locator('[data-design-style="apple"]').click();
    await expect(page.locator('body')).toHaveClass(/design-apple/);
    await page.locator('[data-design-style="upscayl"]').click();
    await expect(page.locator('body')).toHaveClass(/design-upscayl/);
  });

  test('标题正确', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Sakura_Love/);
  });

  test('导航栏存在', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('.site-header .nav');
    await expect(nav).toBeVisible();
    await expect(page.locator('.logo')).toHaveText('Sakura_Love');
  });

  test('Hero 区域渲染', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero h1')).toHaveText('Sakura_Love');
    await expect(page.locator('.hero .intro')).toBeVisible();
    await expect(page.locator('.hero-actions .btn.primary')).toBeVisible();
    await expect(page.locator('.hero-actions .btn.secondary')).toBeVisible();
  });

  test('侧边栏导航链接存在', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('.sidebar-link');
    await expect(links).toHaveCount(7);
    await expect(links.nth(0)).toContainText('首页');
    await expect(links.nth(5)).toContainText('联系');
    await expect(links.last()).toContainText('页面设置');
  });
});

test.describe('页面导航', () => {
  test('点击首页背景会出现语录且按钮仍可导航', async ({ page }) => {
    await page.goto('/');
    await page.locator('.hero-inner').click({ position: { x: 12, y: 12 } });
    await expect(page.locator('.click-pop-text')).toHaveCount(1);
    await expect(page.locator('.click-pop-text')).toHaveText(/\S/);
    await page.locator('.hero-actions .btn.primary').click();
    await expect(page).toHaveURL(/#projects$/);
  });

  test('减少动态效果时语录仍可阅读并会自动消失', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.locator('.hero-inner').click({ position: { x: 12, y: 12 } });
    await expect(page.locator('.click-pop-text')).toBeVisible();
    await page.waitForTimeout(800);
    await expect(page.locator('.click-pop-text')).toBeVisible();
    await expect(page.locator('.click-pop-text')).toHaveCount(0, { timeout: 4000 });
  });

  test('所有风格的内容区都有粒子鼠标交互且不遮挡内容', async ({ page }) => {
    await page.goto('/');
    const heading = page.locator('#projects h2');
    await heading.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.evaluate(() => {
      window.particleMoves = 0;
      document.querySelector('#particle-canvas canvas').addEventListener('mousemove', () => window.particleMoves++);
    });
    for (const style of ['upscayl', 'apple', 'linear', 'spotify', 'figma', 'notion']) {
      await page.locator(`[data-design-style="${style}"]`).evaluate(button => button.click());
      await expect(page.locator('body')).toHaveClass(new RegExp(`design-${style}`));
      await page.evaluate(() => { window.particleMoves = 0; });
      const box = await heading.boundingBox();
      await page.mouse.move(box.x + box.width / 3, box.y + box.height / 2);
      await page.mouse.move(box.x + box.width * 2 / 3, box.y + box.height / 2);
      await expect.poll(() => page.evaluate(() => window.particleMoves)).toBeGreaterThan(0);
      expect(await page.evaluate(() => document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.closest('#particle-canvas'))).toBeNull();
    }
  });

  test('粒子默认持续运动并可手动暂停和恢复', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('#particle-canvas canvas')).toHaveCount(1);
    const changedPixels = () => page.evaluate(async () => {
      const canvas = document.querySelector('#particle-canvas canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });
      const before = context.getImageData(0, 0, canvas.width, canvas.height).data;
      await new Promise(resolve => setTimeout(resolve, 400));
      const after = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let changed = 0;
      for (let i = 0; i < before.length; i += 32) if (before[i] !== after[i]) changed++;
      return changed;
    });
    expect(await changedPixels()).toBeGreaterThan(20);
    await page.locator('#particle-motion-toggle').click();
    await page.waitForTimeout(100);
    expect(await changedPixels()).toBe(0);
    await page.reload();
    await expect(page.locator('#particle-motion-toggle')).toHaveAttribute('aria-pressed', 'false');
    expect(await changedPixels()).toBe(0);
    await page.locator('#particle-motion-toggle').click();
    expect(await changedPixels()).toBeGreaterThan(20);
  });

  test('粒子粗细可以调节并在刷新后保留', async ({ page }) => {
    await page.goto('/');
    const slider = page.locator('#particle-line-width');
    await expect(slider).toHaveValue('1.6');
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveValue('1.8');
    await slider.evaluate(el => { el.value = '2.4'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await expect.poll(() => page.evaluate(() => Math.round(document.querySelector('#particle-canvas canvas').getContext('2d').lineWidth * 10) / 10)).toBe(2.4);
    await expect(page.locator('#particle-line-width-value')).toHaveText('2.4px');
    await page.reload();
    await expect(page.locator('#particle-line-width')).toHaveValue('2.4');
    await page.locator('#language-toggle').click();
    await expect(page.locator('.particle-width-switch label')).toHaveText('Particle width');
  });

  test('关于面板连续点击后可以顺畅收起', async ({ page }) => {
    await page.goto('/');
    const panel = page.locator('#about > .about-panel').first();
    await panel.locator('summary').evaluate(summary => { summary.click(); summary.click(); });
    await page.waitForTimeout(600);
    await expect(panel).toHaveJSProperty('open', false);
  });

  test('项目卡片悬停时随光标轻微侧倾并在离开后复位', async ({ page }) => {
    await page.goto('/');
    await page.locator('#projects h2').evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await page.locator('.project-scroll-viewport').evaluate(el => el.dispatchEvent(new PointerEvent('pointerenter')));
    const card = page.locator('.project-scroll-track > .project-grid').first().locator('.card').nth(1);
    const box = await card.boundingBox();
    await page.mouse.move(box.x + box.width * .75, box.y + box.height * .25);
    await expect.poll(() => card.evaluate(el => getComputedStyle(el).transform)).toMatch(/matrix3d/);
    await page.mouse.move(250, 100);
    await expect.poll(() => card.evaluate(el => el.style.getPropertyValue('--tilt-x'))).toBe('');
  });

  test('点击关于我导航到对应分区', async ({ page }) => {
    await page.goto('/');
    // force: true 绕过 Live2D canvas 遮挡
    await page.locator('.sidebar-link[href="#about"]').click({ force: true });
    await expect(page.locator('#about')).toBeVisible();
  });

  test('点击项目导航到对应分区', async ({ page }) => {
    await page.goto('/');
    await page.locator('.sidebar-link[href="#projects"]').click({ force: true });
    await expect(page.locator('#projects')).toBeVisible();
  });

  test('点击音乐导航到音乐收藏', async ({ page }) => {
    await page.goto('/');
    await page.locator('.sidebar-link[href="#music-library"]').click({ force: true });
    await expect(page.locator('#music-library')).toBeVisible();
  });
});
