const { test, expect } = require('@playwright/test');

test.describe('首页', () => {
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
