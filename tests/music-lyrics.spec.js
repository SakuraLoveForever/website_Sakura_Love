const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const lyric = '[00:01.00]第一句\n[00:04.00]第二句\n[00:07.00]第三句\n[00:10.00]第四句\n[00:13.00]第五句\n[00:16.00]第六句';
const translation = '[00:01.00]First line\n[00:04.00]Second line';
const onlineUrl = 'https://music-test.example/track.mp3';

async function openMusic(page, response = { url: onlineUrl, lyric, translation }, delay = 0) {
  await page.addInitScript(() => localStorage.setItem('live2dEnabled', 'false'));
  await page.route('**/api/music/track?*', async route => {
    if (delay) await new Promise(resolve => setTimeout(resolve, delay));
    await route.fulfill({ json: response });
  });
  await page.route(onlineUrl, route => {
    const body = fs.readFileSync(path.join(__dirname, '../assets/music/02/1.mp3'));
    const start = Number(/bytes=(\d+)/.exec(route.request().headers().range || '')?.[1] || 0);
    return route.fulfill({
      status: 206,
      contentType: 'audio/mpeg',
      headers: { 'Access-Control-Allow-Origin': '*', 'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${start}-${body.length - 1}/${body.length}` },
      body: body.subarray(start),
    });
  });
  await page.goto('/');
  await page.locator('.music-library-head').click();
}

test('在线曲目显示真实歌名，歌词跟随进度并可点击跳转，不滚动整个页面', async ({ page }) => {
  await openMusic(page);
  await expect(page.locator('#music-library-title')).toHaveText('Beautiful World');
  await expect(page.locator('#music-library-source')).toContainText('在线');
  await expect(page.locator('#music-library-lyrics button')).toHaveCount(6);
  await page.waitForFunction(() => document.querySelector('#music-library-audio').readyState >= 1);
  await page.locator('#music-library-audio').evaluate(audio => { audio.currentTime = 5; });
  await expect(page.locator('#music-library-lyrics [aria-current="true"]')).toContainText('第二句');
  await expect(page.locator('#music-library-lyrics [aria-current="true"]')).toContainText('Second line');
  const scrollBefore = await page.evaluate(() => window.scrollY);
  await page.locator('#music-library-audio').evaluate(audio => { audio.currentTime = 16; });
  await expect(page.locator('#music-library-lyrics [aria-current="true"]')).toContainText('第六句');
  await expect.poll(() => page.locator('#music-library-lyrics').evaluate(el => el.scrollTop)).toBeGreaterThan(100);
  expect(Math.abs(await page.evaluate(() => window.scrollY) - scrollBefore)).toBeLessThan(3);
  await page.getByRole('button', { name: '第二句 Second line', exact: true }).click();
  expect(await page.locator('#music-library-audio').evaluate(audio => audio.currentTime)).toBeCloseTo(4, 0);
});

test('歌词区保持小巧，当前句精确居中且首尾歌词不会被渐隐裁掉', async ({ page }) => {
  await openMusic(page);
  const panel = page.locator('.music-lyrics-panel');
  expect((await panel.boundingBox()).height).toBeLessThan(180);
  const lyrics = page.locator('#music-library-lyrics');
  expect(await lyrics.evaluate(el => getComputedStyle(el).maskImage)).not.toBe('none');
  await page.waitForFunction(() => musicLibraryAudio.readyState >= 1);
  for (const time of [1.5, 16.5]) {
    await page.locator('#music-library-audio').evaluate((audio, time) => { audio.currentTime = time; }, time);
    await expect.poll(() => lyrics.evaluate(el => {
      const active = el.querySelector('[aria-current="true"]');
      if (!active) return 1000;
      const line = active.getBoundingClientRect(), region = el.getBoundingClientRect();
      return Math.abs(line.top + line.height / 2 - region.top - region.height / 2);
    })).toBeLessThan(3);
  }
});

test('侧栏展开导致长歌词换行时，当前句仍保持居中', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openMusic(page, { url: null, lyric: `[00:00.00]${'歌词'.repeat(30)}\n[00:10.00]末尾`, translation: '' });
  await expect(page.locator('#music-library-lyrics button')).toHaveCount(2);
  await page.locator('#sidebar-toggle').click();
  await expect.poll(() => page.locator('#music-library-lyrics').evaluate(el => {
    const line = el.querySelector('[aria-current="true"]')?.getBoundingClientRect();
    const region = el.getBoundingClientRect();
    return line ? Math.abs(line.top + line.height / 2 - region.top - region.height / 2) : 1000;
  })).toBeLessThan(3);
});

test('本地文件缺失时，点击播放后在线音源仍能自动接续', async ({ page }) => {
  await page.route('**/assets/music/02/1.mp3', route => route.abort());
  await openMusic(page, { url: onlineUrl, lyric, translation }, 600);
  await page.locator('#music-library-play').click();
  await expect(page.locator('#music-library-source')).toContainText('在线');
  await expect.poll(() => page.locator('#music-library-audio').evaluate(audio => !audio.paused && audio.currentTime > 0)).toBe(true);
});

test('兼容冒号毫秒、多时间标签与歌词偏移，歌词文本不会被当作 HTML', async ({ page }) => {
  await openMusic(page, { url: null, lyric: '[offset:500]\n[00:01:50][00:05:50]重复句\n[00:03.5]<img src=x onerror=alert(1)>', translation: '' });
  await expect(page.locator('#music-library-lyrics button')).toHaveCount(3);
  await page.waitForFunction(() => musicLibraryAudio.readyState >= 1);
  await page.locator('#music-library-audio').evaluate(audio => { audio.currentTime = 1.1; });
  await expect(page.locator('#music-library-lyrics [aria-current="true"]')).toHaveText('重复句');
  await page.locator('#music-library-audio').evaluate(audio => { audio.currentTime = 3.1; });
  await expect(page.locator('#music-library-lyrics [aria-current="true"]')).toHaveText('<img src=x onerror=alert(1)>');
  await expect(page.locator('#music-library-lyrics img')).toHaveCount(0);
});

test('在线音源不可用时保留本地播放和同步歌词', async ({ page }) => {
  await openMusic(page, { url: null, lyric, translation });
  await expect(page.locator('#music-library-source')).toContainText('本地');
  await expect(page.locator('#music-library-audio')).toHaveAttribute('src', 'assets/music/02/1.mp3');
  await expect(page.locator('#music-library-lyrics button')).toHaveCount(6);
});

test('在线音频加载失败只回退一次，不丢失进度或音量', async ({ page }) => {
  await openMusic(page);
  await expect(page.locator('#music-library-source')).toContainText('在线');
  await page.waitForFunction(() => document.querySelector('#music-library-audio').readyState >= 1);
  await page.locator('#music-library-volume').fill('15');
  await page.locator('#music-library-audio').evaluate(audio => {
    audio.currentTime = 9;
    audio.dispatchEvent(new Event('error'));
  });
  await expect(page.locator('#music-library-source')).toContainText('本地');
  await expect(page.locator('#music-library-audio')).toHaveAttribute('src', 'assets/music/02/1.mp3');
  await page.waitForFunction(() => document.querySelector('#music-library-audio').readyState >= 1);
  expect(await page.locator('#music-library-audio').evaluate(audio => audio.currentTime)).toBeCloseTo(9, 0);
  expect(await page.locator('#music-library-audio').evaluate(audio => audio.volume)).toBeCloseTo(.15);
});

test('快速切歌不会让较晚返回的旧歌词覆盖新歌曲', async ({ page }) => {
  let resolveFirst;
  await page.addInitScript(() => localStorage.setItem('live2dEnabled', 'false'));
  await page.route('**/api/music/track?*', async route => {
    const id = new URL(route.request().url()).searchParams.get('id');
    if (id === '547976226') await new Promise(resolve => { resolveFirst = resolve; });
    await route.fulfill({ json: { url: null, lyric: id === '547976226' ? '[00:00.00]旧歌' : '[00:00.00]新歌', translation: '' } });
  });
  await page.goto('/');
  await page.locator('.music-library-head').click();
  await expect.poll(() => Boolean(resolveFirst)).toBe(true);
  await page.locator('#header-music-next').click();
  await expect(page.locator('#music-library-lyrics')).toContainText('新歌');
  resolveFirst();
  await page.waitForTimeout(150);
  await expect(page.locator('#music-library-lyrics')).not.toContainText('旧歌');
});

test('接口故障时桌面布局仍可播放本地歌曲', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.addInitScript(() => localStorage.setItem('live2dEnabled', 'false'));
  await page.route('**/api/music/track?*', route => route.fulfill({ status: 503, json: { error: 'unavailable' } }));
  await page.goto('/');
  await page.locator('.music-library-head').click();
  await expect(page.locator('#music-library-source')).toContainText('本地');
  await expect(page.locator('#music-library-lyrics')).toContainText('暂无');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1280);
});
