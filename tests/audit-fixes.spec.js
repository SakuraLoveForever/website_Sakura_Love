const { test, expect } = require('@playwright/test');

test('透明看板娘画布穿透点击，项目是静态卡片（无横向轨道）', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#live2d-canvas')).toHaveCSS('pointer-events', 'none');
  await page.locator('.sidebar-link[href="#projects"]').click();
  await expect(page).toHaveURL(/#projects$/);
  await expect(page.locator('#projects .card')).toHaveCount(12);
  await expect(page.locator('.project-scroll-track')).toHaveCount(0);
});

test('354px 移动布局导航有文字，设置控件完整容纳', async ({ page }) => {
  await page.setViewportSize({ width: 354, height: 767 });
  const models = [];
  page.on('request', request => { if (request.url().includes('.model3.json')) models.push(request.url()); });
  await page.goto('/');
  await expect(page.locator('body')).toHaveCSS('padding-left', '0px');
  await expect(page.locator('.sidebar-label').first()).toHaveCSS('opacity', '1');
  for (const style of ['apple', 'shadcn', 'tailwind']) {
    await page.locator(`[data-design-style="${style}"]`).click();
    await expect(page.locator('body')).toHaveClass(new RegExp(`design-${style}`));
    const overflow = await page.locator('#page-bottom').evaluate(footer => [...footer.querySelectorAll('button,input,a')].filter(el => {
      const r = el.getBoundingClientRect();
      return r.width && (r.left < 0 || r.right > innerWidth + 1);
    }).map(el => el.id || el.textContent));
    expect(overflow).toEqual([]);
  }
  expect(models).toEqual([]);
  await page.locator('.music-library-head').click();
  await expect.poll(() => page.locator('.music-library-stage').evaluate(el => el.clientWidth)).toBeGreaterThan(250);
  await expect(page.locator('.music-role-group').first()).toBeVisible();
  expect(await page.locator('.music-role-group').first().evaluate(card => {
    const outer = card.getBoundingClientRect();
    const info = card.querySelector('.music-role-info').getBoundingClientRect();
    return info.left >= outer.left && info.right <= outer.right && info.bottom <= outer.bottom;
  })).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(354);
});

test('角色缩略图使用小图，键盘可选择并告知播放行为', async ({ page }) => {
  await page.goto('/#music-library');
  await page.locator('.music-library-head').click();
  const card = page.locator('.music-role-group').nth(1);
  await expect(card).toHaveJSProperty('tagName', 'BUTTON');
  await expect(card).toHaveAttribute('aria-label', /播放/);
  await expect(card.locator('img')).toHaveAttribute('src', /thumbnails\/.+\.jpg$/);
  await card.focus();
  await page.keyboard.press('Enter');
  await expect(card).toHaveAttribute('aria-pressed', 'true');
});

test('暂停粒子后鼠标和普通点击均不会重绘或增殖', async ({ page }) => {
  // 2026-10-06：粒子运动改为「默认开启」，暂停必须由用户显式点击触发，
  // 所以这里不再依赖 prefers-reduced-motion，而是真的把开关按一下。
  await page.goto('/');
  await expect(page.locator('#particle-motion-toggle')).toHaveAttribute('aria-pressed', 'true');
  await page.evaluate(() => document.querySelector('#particle-motion-toggle').click());
  await expect(page.locator('#particle-motion-toggle')).toHaveAttribute('aria-pressed', 'false');
  await page.evaluate(() => {
    window.particleDraws = 0;
    const context = document.querySelector('#particle-canvas canvas').getContext('2d');
    const clear = context.clearRect.bind(context);
    context.clearRect = (...args) => { window.particleDraws++; return clear(...args); };
  });
  await page.mouse.move(500, 200);
  await page.mouse.click(500, 200);
  expect(await page.evaluate(() => window.particleDraws)).toBe(0);
});

test('收藏折叠时不请求角色图片原图或缩略图', async ({ page }) => {
  const images = [];
  page.on('request', request => {
    if (/assets\/(backgrounds|thumbnails)\//.test(request.url())) images.push(request.url());
  });
  await page.goto('/');
  expect(images).toEqual([]);
  await page.locator('.music-library-head').click();
  await expect.poll(() => images.some(url => url.includes('/thumbnails/'))).toBe(true);
  expect(images.filter(url => url.includes('/backgrounds/') && !url.includes('/02/'))).toEqual([]);
});
