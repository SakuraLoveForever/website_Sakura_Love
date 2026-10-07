const { test, expect } = require('@playwright/test');

test('页脚社交链接与右下角跳转按钮不重叠', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const width of [1280, 1536, 390, 354]) {
    await page.setViewportSize({ width, height: 800 });
    for (const theme of ['apple', 'shadcn', 'tailwind']) {
      const overlaps = await page.evaluate(theme => {
        applyStyle(theme);
        window.scrollTo(0, document.documentElement.scrollHeight);
        const buttons = [...document.querySelectorAll('.quick-jump .jump-btn')].map(el => el.getBoundingClientRect());
        return [...document.querySelectorAll('.social-links-bottom a')].filter(el => {
          const link = el.getBoundingClientRect();
          return buttons.some(button => link.left < button.right && link.right > button.left && link.top < button.bottom && link.bottom > button.top);
        }).map(el => el.getAttribute('aria-label'));
      }, theme);
      expect(overlaps, `${width}px / ${theme}`).toEqual([]);
    }
  }
});

test('点击四角时语录保持可读宽度且完整留在视口内', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 800 });
    for (const [x, y] of [[width - 2, 400], [2, 400], [width - 2, 798], [2, 2]]) {
      const box = await page.evaluate(({ x, y }) => {
        document.querySelectorAll('.click-pop-text').forEach(el => el.remove());
        showClickText(x, y, '摆脱低俗的多巴胺，追随高级的内啡肽');
        const r = document.querySelector('.click-pop-text').getBoundingClientRect();
        return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
      }, { x, y });
      expect(box.width).toBeGreaterThan(180);
      expect(box.height).toBeLessThan(100);
      expect(box.left).toBeGreaterThanOrEqual(15);
      expect(box.right).toBeLessThanOrEqual(width - 15);
      expect(box.top).toBeGreaterThanOrEqual(0);
      expect(box.bottom).toBeLessThanOrEqual(800);
    }
  }
});

test('主题只保留 Apple、shadcn/ui、Tailwind Blog，旧设置回退 Apple', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => { if (!localStorage.getItem('stylePreset')) localStorage.setItem('stylePreset', 'upscayl'); });
  await page.goto('/');
  await expect(page.locator('.design-style-btn')).toHaveCount(3);
  await expect(page.locator('body')).toHaveClass(/design-apple/);
  expect(await page.evaluate(() => localStorage.getItem('stylePreset'))).toBe('apple');
  for (const [key, canvas] of [['shadcn', 'rgb(250, 250, 250)'], ['tailwind', 'rgb(255, 251, 247)'], ['apple', 'rgb(29, 29, 31)']]) {
    await page.evaluate(key => document.querySelector(`[data-design-style="${key}"]`).click(), key);
    await expect(page.locator('body')).toHaveClass(new RegExp(`design-${key}`));
    await expect(page.locator(`[data-design-style="${key}"]`)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('html')).toHaveCSS('background-color', canvas);
    expect(await page.evaluate(() => document.documentElement.style.colorScheme)).toBe(key === 'apple' ? 'dark' : 'light');
    await page.reload();
    await expect(page.locator('body')).toHaveClass(new RegExp(`design-${key}`));
    await expect(page.locator('html')).toHaveCSS('background-color', canvas);
  }
});
