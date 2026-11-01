const { test, expect } = require('@playwright/test');

/** Portfolio layout and existing responsive/i18n regressions. */

/** 11 张卡的标题顺序 —— 与 index.html 的 DOM 顺序、script.js 的 i18n 数组一一对应 */
const TITLES_ZH = [
  '卷里山河，心头月色', '心灵鸡汤 - 互动语录', 'Kindle笔记导出工具',
  '电脑守护精灵', 'FileGo', 'tab-sync', 'AppCounter',
  'YouTube取消点赞脚本', 'auto_clean', 'AI 追番助手', 'GitHub个人首页',
];

test('作品集保留十一个项目和直接链接，使用截图', async ({ page }) => {
  await page.goto('/');
  const grid = page.locator('#projects .project-grid');
  await expect(grid.locator(':scope > .card')).toHaveCount(11);
  await expect(grid.locator('.card-cover')).toHaveCount(11);
  await expect(grid.locator('.card-cover img')).toHaveCount(10);
  const hrefs = await grid.locator('.project-title-btn').evaluateAll(els => els.map(a => ({ tag: a.tagName, href: a.getAttribute('href') })));
  expect(hrefs).toHaveLength(11);
  for (const h of hrefs) { expect(h.tag).toBe('A'); expect(h.href).toMatch(/^https:\/\//); }
  await expect(page.locator('.project-scroll-track')).toHaveCount(0);
});

test('桌面项目按三列等宽顺序浏览', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('/');
  const result = await page.locator('#projects .project-grid').evaluate(grid => {
    const outer = grid.getBoundingClientRect();
    const cards = [...grid.querySelectorAll('.card')].map(card => card.getBoundingClientRect());
    return { columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length, width: outer.width,
      normalWidths: cards.map(card => card.width),
      overflow: cards.some(card => card.right > outer.right + 1) };
  });
  expect(result.columns).toBe(3);
  expect(Math.max(...result.normalWidths) - Math.min(...result.normalWidths)).toBeLessThan(2);
  expect(result.overflow).toBe(false);
});

test('窄窗口项目自然折为单列，不产生隐式窄列或横向溢出', async ({ page }) => {
  for (const width of [390, 500]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    const r = await page.evaluate(() => {
      const grid = document.querySelector('#projects .project-grid');
      const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean);
      const widths = [...grid.querySelectorAll(':scope > .card')].map(c => c.getBoundingClientRect().width);
      return { cols: cols.length, minW: Math.min(...widths), gridW: grid.getBoundingClientRect().width, height: grid.getBoundingClientRect().height };
    });
    expect(r.cols, `${width}px 应自然折为单列`).toBe(1);
    expect(r.minW, `${width}px 有卡片被挤成窄条`).toBeGreaterThan(60);
    expect(r.height, `${width}px 区块高度异常`).toBeLessThan(6000);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  }
});

test('减少动画时项目卡片不再带 8px 模糊（CSS 特异性回归）', async ({ page }) => {
  /*
   * `html.js .card.reveal-on-scroll{filter:blur(8px)}`（特异性 0,3,1）
   * 曾经压过 reduced-motion 里的 `html.js .reveal-on-scroll{filter:none}`（0,2,1），
   * 于是开启"减少动画"的用户第一眼看到的是糊的卡片（实测 opacity=1 但 filter=blur(8px)）。
   */
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForTimeout(500);
  // 停留在页面顶部，保证最后几张卡还没进入视口（即未加 .is-revealed）
  const r = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('#projects .card')];
    const last = cards[cards.length - 1];
    return {
      total: cards.length,
      revealed: last.classList.contains('is-revealed'),
      filter: getComputedStyle(last).filter,
      opacity: getComputedStyle(last).opacity,
    };
  });
  expect(r.total).toBe(11);
  expect(r.revealed, '最后一张卡不应已 reveal，否则测不到未进视口的状态').toBe(false);
  expect(r.filter, `未 reveal 的卡片在减少动画下仍被模糊：${r.filter}`).toBe('none');
  expect(r.opacity).toBe('1');
});

test('旧英文设置和刷新后 11 张卡的中文标题与描述正确对应', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('languageMode', 'en'));
  await page.goto('/');
  const titles = () => page.locator('#projects .project-title-btn').allTextContents();
  await expect.poll(titles).toEqual(TITLES_ZH);

  // 描述不能整体错位（数组是按 DOM 索引写回的，改顺序必须同步改数组）
  const firstDesc = await page.locator('#projects .project-grid .card p').first().textContent();
  expect(firstDesc).toContain('记录阅读');

  await page.reload();
  await expect.poll(titles).toEqual(TITLES_ZH);
  await expect(page.locator('#projects .project-grid .card p').first()).toContainText('记录阅读');
});
