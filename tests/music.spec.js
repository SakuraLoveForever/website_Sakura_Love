const { test, expect } = require('@playwright/test');

test.describe('音乐收藏模块', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#music-library');
    await page.waitForSelector('#music-library');
    // Expand music library if collapsed
    const details = page.locator('.music-library-details');
    if (await details.isVisible() && !(await details.evaluate(el => el.open))) {
      await page.locator('.music-library-head').click();
      await page.waitForTimeout(500);
    }
  });

  test('音乐收藏区域完整渲染', async ({ page }) => {
    await expect(page.locator('.music-library-shell')).toBeVisible();
    await expect(page.locator('.music-library-head h2')).toHaveText('音乐收藏');
  });

  test('音乐收藏标题存在', async ({ page }) => {
    await expect(page.locator('.music-library-head h2')).toHaveText('音乐收藏');
  });

  test('左右双栏布局存在', async ({ page }) => {
    await expect(page.locator('.music-library-body')).toBeVisible();
    await expect(page.locator('.music-library-left')).toBeVisible();
    await expect(page.locator('.music-library-right')).toBeVisible();
  });

  test('角色卡片带头像和歌曲数', async ({ page }) => {
    const cards = page.locator('.music-role-group');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    const firstCard = cards.first();
    await expect(firstCard.locator('.music-role-thumb-sm')).toBeVisible();
    await expect(firstCard.locator('.music-role-name')).toBeVisible();
    await expect(firstCard.locator('.music-role-count')).toBeVisible();

    // 验证歌曲计数包含"首"
    await expect(firstCard.locator('.music-role-count')).toContainText('首');
  });

  test('点击角色卡片不报错', async ({ page }) => {
    const cards = page.locator('.music-role-group');
    await cards.first().scrollIntoViewIfNeeded();
    await expect(cards.first()).toBeVisible();
    await cards.first().click({ force: true });
  });

  test('底部播放栏存在', async ({ page }) => {
    await expect(page.locator('.music-player-bar')).toBeVisible();
    await expect(page.locator('#music-library-play')).toBeVisible();
    await expect(page.locator('#music-library-progress')).toBeVisible();
    await expect(page.locator('#music-library-volume')).toBeVisible();
  });

  test('播放按钮可点击', async ({ page }) => {
    const playBtn = page.locator('#music-library-play');
    await expect(playBtn).toBeVisible();
    await playBtn.click({ force: true });
  });

  test('图片展示舞台为正方形', async ({ page }) => {
    const stage = page.locator('.music-library-stage');
    await expect(stage).toBeVisible();
    const box = await stage.boundingBox();
    expect(box).not.toBeNull();
    expect(Math.abs(box.width - box.height)).toBeLessThanOrEqual(3);
  });

  test('舞台纯图片无文字遮挡', async ({ page }) => {
    await expect(page.locator('.music-stage-overlay')).toHaveCount(0);
    await expect(page.locator('.music-stage-title')).toHaveCount(0);
  });
});
