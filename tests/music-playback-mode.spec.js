const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('live2dEnabled', 'false'));
  await page.goto('/');
  await page.locator('.music-library-details > summary').click();
  await page.waitForFunction(() => musicLibraryTracks.length > 1);
});

test('默认顺序播放，播完跨角色续播并在末尾回到第一首', async ({ page }) => {
  await expect(page.getByLabel('音乐收藏播放模式')).toHaveValue('sequential');
  const result = await page.evaluate(() => {
    const playable = musicLibraryTracks.map((track, index) => track.audioUrl ? index : -1).filter(index => index >= 0);
    setMusicLibraryTrack(playable.at(-1));
    musicLibraryAudio.dispatchEvent(new Event('ended'));
    return { actual: musicLibraryIndex, expected: playable[0], src: musicLibraryAudio.getAttribute('src'), expectedSrc: musicLibraryTracks[playable[0]].audioUrl };
  });
  expect(result.actual).toBe(result.expected);
  expect(result.src).toBe(result.expectedSrc);
  await page.locator('#header-music-prev').click();
  expect(await page.evaluate(() => musicLibraryIndex)).toBe(await page.evaluate(() => musicLibraryTracks.length - 1));
});

test('随机播放自动和手动切歌均不重复当前曲目，并记住模式', async ({ page }) => {
  await page.getByLabel('音乐收藏播放模式').selectOption('random');
  const selections = await page.evaluate(() => {
    const selections = [];
    for (let i = 0; i < 12; i++) {
      const previous = musicLibraryIndex;
      musicLibraryAudio.dispatchEvent(new Event('ended'));
      selections.push({ previous, next: musicLibraryIndex, playable: Boolean(musicLibraryTracks[musicLibraryIndex]?.audioUrl) });
    }
    return selections;
  });
  selections.forEach(selection => {
    expect(selection.next).not.toBe(selection.previous);
    expect(selection.playable).toBe(true);
  });
  const previous = await page.evaluate(() => musicLibraryIndex);
  await page.locator('#header-music-next').click();
  expect(await page.evaluate(() => musicLibraryIndex)).not.toBe(previous);
  await expect(page.locator('#toast-root')).toBeEmpty();
  await page.reload();
  await page.locator('.music-library-details > summary').click();
  await expect(page.getByLabel('音乐收藏播放模式')).toHaveValue('random');
  await page.setViewportSize({ width: 354, height: 800 });
  await expect(page.getByLabel('音乐收藏播放模式')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(354);
});

test('默认音量为30%，调节后的音量刷新仍保留，包括静音数值', async ({ page }) => {
  expect(await page.locator('#music-library-audio').evaluate(audio => audio.volume)).toBeCloseTo(.3);
  await expect(page.locator('#music-library-volume')).toHaveValue('30');
  for (const volume of [15, 0]) {
    await page.locator('#music-library-volume').fill(String(volume));
    await page.reload();
    await page.locator('.music-library-details > summary').click();
    await expect(page.locator('#music-library-volume')).toHaveValue(String(volume));
    expect(await page.locator('#music-library-audio').evaluate(audio => audio.volume)).toBeCloseTo(volume / 100);
  }
});
