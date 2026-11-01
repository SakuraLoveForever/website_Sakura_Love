const { test, expect } = require('@playwright/test');

test('窗口缩小时页面自适应，无横向滚动，仍使用统一的竖向侧栏', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('layoutMode', 'mobile');
    localStorage.setItem('live2dEnabled', 'false');
  });
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto('/');
  await expect(page.locator('body')).not.toHaveClass(/layout-mobile/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1024);
  expect(await page.evaluate(() => localStorage.getItem('layoutMode'))).toBeNull();
  const navRows = await page.locator('.sidebar-link').evaluateAll(rows => rows.slice(0, 2).map(row => ({ x: row.offsetLeft, y: row.offsetTop })));
  expect(navRows[1].x).toBe(navRows[0].x);
  expect(navRows[1].y).toBeGreaterThan(navRows[0].y);
  await page.locator('.music-library-details').evaluate(el => { el.open = true; });
  await page.waitForFunction(() => musicLibraryTracks.length > 0);
  const columns = await page.evaluate(() => {
    const left = document.querySelector('.music-library-left').getBoundingClientRect();
    const right = document.querySelector('.music-library-right').getBoundingClientRect();
    return { sideBySide: left.right <= right.left + 1, aligned: Math.abs(left.top - right.top) < 3 };
  });
  expect(columns).toEqual({ sideBySide: true, aligned: true });
  for (const width of [1920, 1440, 1280, 1100, 1024, 900, 768, 600, 390, 354]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.locator('body')).not.toHaveClass(/layout-mobile/);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    const overflow = await page.locator('.music-library-shell').evaluate(shell => {
      const box = shell.getBoundingClientRect();
      return [...shell.querySelectorAll('.music-library-body,.music-lyrics-panel,.music-player-bar,.player-bar-group,.player-bar-right')].filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.right > box.right + 1;
      }).map(el => el.className);
    });
    expect(overflow, `${width}px`).toEqual([]);
  }
});

test('真实手机视口也使用可伸缩页面，不再强制放大桌面画布', async ({ browser }) => {
  const context = await browser.newContext({ isMobile: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.addInitScript(() => localStorage.setItem('live2dEnabled', 'false'));
  await page.goto('http://127.0.0.1:8080/');
  expect(await page.evaluate(() => innerWidth)).toBe(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await expect(page.locator('body')).not.toHaveClass(/layout-mobile/);
  await expect(page.locator('.view-mode-switch')).toHaveCount(0);
  await context.close();
});

test('手动展开侧栏时，不同主题和启动器也不会挤出横向页面', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    localStorage.setItem('live2dEnabled', 'false');
    localStorage.setItem('sidebarCollapsed', 'false');
  });
  for (const url of ['/', '/?launcher']) {
    await page.goto(url);
    await page.locator('.music-library-details').evaluate(el => { el.open = true; });
    for (const width of [354, 390, 768, 900, 1024, 1280, 1536]) {
      await page.setViewportSize({ width, height: 900 });
      for (const theme of ['apple', 'fuwari', 'astropaper', 'rem']) {
        await page.evaluate(theme => applyStyle(theme), theme);
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth), { message: `${url} ${width}px ${theme}` }).toBe(width);
        const hiddenLinks = await page.locator('.site-header a').evaluateAll(links => links.filter(link => {
          const rect = link.getBoundingClientRect();
          return rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1);
        }).map(link => link.getAttribute('aria-label') || link.textContent));
        expect(hiddenLinks, `${url} ${width}px ${theme}`).toEqual([]);
      }
    }
  }
});

test('自动收放侧栏时，读屏标签和按钮状态同步更新', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('live2dEnabled', 'false'));
  await page.goto('/');
  for (const [width, action, pressed] of [[900, '展开', 'true'], [1440, '收缩', 'false']]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.locator('#sidebar-toggle')).toHaveAttribute('aria-pressed', pressed);
    await expect(page.locator('#sidebar-toggle')).toHaveAttribute('aria-label', new RegExp(action));
  }
});
