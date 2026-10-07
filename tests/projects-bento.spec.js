const { test, expect } = require('@playwright/test');

/** Portfolio layout and existing responsive/i18n regressions. */

/** 12 张卡的标题顺序 —— 与 index.html 的 DOM 顺序、script.js 的 i18n 数组一一对应 */
const TITLES_ZH = [
  'MacroFlowStudio', '卷里山河，心头月色', '心灵鸡汤 - 互动语录', 'Kindle笔记导出工具',
  '电脑守护精灵', 'FileGo', 'tab-sync', 'AppCounter',
  'YouTube取消点赞脚本', 'auto_clean', 'AI 追番助手', 'GitHub个人首页',
];

test('作品集保留十二个项目和直接链接，使用截图与一张精选卡', async ({ page }) => {
  await page.goto('/');
  const grid = page.locator('#projects .project-grid');
  await expect(grid.locator(':scope > .card')).toHaveCount(12);
  await expect(grid.locator('.card--feature')).toHaveCount(1);
  await expect(grid.locator('.card-cover')).toHaveCount(12);
  await expect(grid.locator('.card-cover img')).toHaveCount(11);
  const hrefs = await grid.locator('.project-title-btn').evaluateAll(els => els.map(a => ({ tag: a.tagName, href: a.getAttribute('href') })));
  expect(hrefs).toHaveLength(12);
  for (const h of hrefs) { expect(h.tag).toBe('A'); expect(h.href).toMatch(/^https:\/\//); }
  await expect(page.locator('.project-scroll-track')).toHaveCount(0);
});

test('桌面精选卡跨满一行，其他项目按三列顺序浏览', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('/');
  const result = await page.locator('#projects .project-grid').evaluate(grid => {
    const outer = grid.getBoundingClientRect();
    const cards = [...grid.querySelectorAll('.card')].map(card => card.getBoundingClientRect());
    return { columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length, width: outer.width,
      featureWidth: cards[0].width, normalWidths: cards.slice(1).map(card => card.width),
      overflow: cards.some(card => card.right > outer.right + 1) };
  });
  expect(result.columns).toBe(3);
  expect(Math.abs(result.featureWidth - result.width)).toBeLessThan(2);
  expect(Math.max(...result.normalWidths) - Math.min(...result.normalWidths)).toBeLessThan(2);
  expect(result.overflow).toBe(false);
});

test('窄屏不会产生隐式第二列（单列栅格 + span 2 的回归）', async ({ page }) => {
  /*
   * 踩过的坑：860px 档给最后一张卡加了 `grid-column: span 2`，
   * 该规则在 560px 以下的单列栅格上依然生效 —— 单列栅格上 span 2 会**创建隐式第二列**，
   * 实测计算出 `0px 342px`，一半卡片被塞进 0 宽列、整块高度从 4697px 炸到 8618px。
   */
  for (const width of [390, 500]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    const r = await page.evaluate(() => {
      const grid = document.querySelector('#projects .project-grid');
      const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean);
      const widths = [...grid.querySelectorAll(':scope > .card')].map(c => c.getBoundingClientRect().width);
      return { cols: cols.length, minW: Math.min(...widths), gridW: grid.getBoundingClientRect().width, height: grid.getBoundingClientRect().height };
    });
    expect(r.cols, `${width}px 应为单列`).toBe(1);
    expect(r.minW, `${width}px 有卡片被挤成窄条`).toBeGreaterThan(60);
    // 单列 12 张卡不该有 8000px 这种高度（坏掉时的实测值是 8618）
    expect(r.height, `${width}px 区块高度异常`).toBeLessThan(6000);
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
  expect(r.total).toBe(12);
  expect(r.revealed, '最后一张卡不应已 reveal，否则测不到未进视口的状态').toBe(false);
  expect(r.filter, `未 reveal 的卡片在减少动画下仍被模糊：${r.filter}`).toBe('none');
  expect(r.opacity).toBe('1');
});

test('中英切换后 12 张卡的标题与描述按索引正确对应', async ({ page }) => {
  await page.goto('/');
  const titles = () => page.locator('#projects .project-title-btn').allTextContents();
  await expect.poll(titles).toEqual(TITLES_ZH);

  // 描述不能整体错位（数组是按 DOM 索引写回的，改顺序必须同步改数组）
  const firstDesc = await page.locator('#projects .project-grid .card p').first().textContent();
  expect(firstDesc).toContain('键鼠宏录制');

  await page.locator('#language-toggle').click();
  await expect.poll(titles).toEqual([
    'MacroFlowStudio', 'Mountains in Pages, Moonlight in Mind', 'Soul Quotes Archive', 'Kindle Notes Exporter',
    'PC Guardian', 'FileGo', 'tab-sync', 'AppCounter',
    'YouTube Unlike Helper', 'auto_clean', 'AI Anime Tracker', 'GitHub Profile',
  ]);
  const enFirst = await page.locator('#projects .project-grid .card p').first().textContent();
  expect(enFirst).toContain('macro studio');

  // 切回中文，确认没有单向损坏
  await page.locator('#language-toggle').click();
  await expect.poll(titles).toEqual(TITLES_ZH);
});
