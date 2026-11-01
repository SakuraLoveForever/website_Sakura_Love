import { test, expect } from '@playwright/test';

const STYLES = ['apple', 'fuwari', 'astropaper', 'rem'];

test('切换风格时页脚按钮位置不变，同一个鼠标坐标始终命中同一个按钮', async ({ page }) => {
  await page.setViewportSize({ width: 1203, height: 700 });
  await page.goto('/');
  await page.waitForTimeout(1200);

  const geometry = async () => page.evaluate(() => {
    const footer = document.querySelector('.site-footer');
    const container = footer.querySelector('.container').getBoundingClientRect();
    const rel = (selector) => {
      const rect = footer.querySelector(selector).getBoundingClientRect();
      return [Math.round(rect.x - container.x), Math.round(rect.y - container.y), Math.round(rect.width), Math.round(rect.height)];
    };
    return {
      height: Math.round(footer.getBoundingClientRect().height),
      styleSwitch: rel('.design-style-switch'),
      quoteSwitch: rel('.quote-category-switch'),
      social: rel('.social-links-bottom'),
      copyright: rel('.site-footer p'),
    };
  });

  await page.evaluate(() => applyStyle('apple'));
  await page.waitForTimeout(500);
  const baseline = await geometry();

  for (const style of STYLES) {
    await page.evaluate((key) => applyStyle(key), style);
    await page.waitForTimeout(500);
    expect(await geometry(), style).toEqual(baseline);
  }

  // Sampling the screen point once and replaying it across styles is exactly the
  // user's complaint: the same click must land on the same control every time.
  const sample = async () => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    return page.evaluate(() => {
      const center = (element) => {
        const rect = element.getBoundingClientRect();
        return { x: Math.round(rect.x + rect.width / 2), y: Math.round(rect.y + rect.height / 2) };
      };
      return {
        rem: center(document.querySelector('[data-design-style="rem"]')),
        social: center(document.querySelector('.social-links-bottom a')),
      };
    });
  };
  const hit = (point) => page.evaluate(({ x, y }) => {
    const button = document.elementFromPoint(x, y)?.closest('button, a');
    return button?.dataset.designStyle ?? button?.className;
  }, point);

  const points = await sample();
  for (const style of STYLES) {
    await page.evaluate((key) => applyStyle(key), style);
    await page.waitForTimeout(400);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    expect(await hit(points.rem), style).toBe('rem');
    expect(await hit(points.social), style).toBe('social-xhs');
  }
});
