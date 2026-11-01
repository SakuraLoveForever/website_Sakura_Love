const { test, expect } = require('@playwright/test');

test('解析音源时升级 HTTPS，拒绝试听和非音乐域名，保留可用歌词', async () => {
  const { resolveMusicTrack } = require('../music-api');
  for (const [url, trialInfo, expected] of [
    ['http://m801.music.126.net/test.mp3', null, 'https://m801.music.126.net/test.mp3'],
    ['http://m801.music.126.net/test.mp3', { start: 0, end: 30 }, null],
    ['https://example.com/test.mp3', null, null],
  ]) {
    const result = await resolveMusicTrack('3340112782', async endpoint => ({
      ok: true,
      json: async () => endpoint.includes('/lyric')
        ? { code: 200, lrc: { lyric: '[00:01.00]歌词' }, tlyric: { lyric: '[00:01.00]Translation' } }
        : { code: 200, data: [{ code: 200, url, trialInfo, expi: 1200 }] },
    }));
    expect(result.url).toBe(expected);
    expect(result.lyric).toBe('[00:01.00]歌词');
    expect(result.translation).toBe('[00:01.00]Translation');
  }
  const preview = await resolveMusicTrack('547976226', async () => ({
    ok: true,
    json: async () => ({ code: 200, data: [{ code: 200, url: 'https://m801.music.126.net/preview.mp3', freeTrialInfo: { start: 0, end: 30 }, expi: 1200 }] }),
  }));
  expect(preview.url).toBeNull();
});

test('音源接口失败时仍返回歌词，便于本地音频同步', async () => {
  const { resolveMusicTrack } = require('../music-api');
  const result = await resolveMusicTrack('3340112782', async endpoint => {
    if (!endpoint.includes('/lyric')) throw new Error('upstream unavailable');
    return { ok: true, json: async () => ({ code: 200, lrc: { lyric: '[00:00.00]歌词' } }) };
  });
  expect(result.url).toBeNull();
  expect(result.lyric).toBe('[00:00.00]歌词');
});

test('本地解析 API 仅接受曲目清单内的歌曲 ID', async ({ request }) => {
  const response = await request.get('/api/music/track?id=https://example.com');
  expect(response.status()).toBe(400);
  const unknown = await request.get('/api/music/track?id=1');
  expect(unknown.status()).toBe(404);
});

test('将平台返回的纯音乐标记显示为无歌词状态', async () => {
  const { resolveMusicTrack } = require('../music-api');
  const result = await resolveMusicTrack('477931', async () => ({ ok: true, json: async () => ({ code: 200, lrc: { lyric: '[00:05.00]纯音乐，请欣赏' } }) }));
  expect(result.instrumental).toBe(true);
});
