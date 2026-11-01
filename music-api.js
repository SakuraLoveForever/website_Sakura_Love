// Only public, full-length streams are accepted. No cookies or account tokens.
async function resolveMusicTrack(id, request = fetch) {
  const read = async (endpoint) => {
    const response = await request(`https://music.163.com/api/song/${endpoint}`, {
      headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://music.163.com/' },
      signal: AbortSignal.timeout(7000),
    });
    if (!response.ok) throw new Error('Music provider unavailable');
    return response.json();
  };
  const [audio, lyrics] = await Promise.allSettled([
    read(`enhance/player/url?ids=${encodeURIComponent(JSON.stringify([Number(id)]))}&br=128000`),
    read(`lyric?id=${id}&lv=-1&tv=-1`),
  ]);
  const stream = audio.status === 'fulfilled' ? audio.value.data?.[0] : null;
  const words = lyrics.status === 'fulfilled' && lyrics.value.code === 200 ? lyrics.value : {};
  let url = null;
  if (stream?.code === 200 && stream.url && !stream.trialInfo && !stream.freeTrialInfo) {
    try {
      const candidate = new URL(stream.url);
      if (['http:', 'https:'].includes(candidate.protocol) && /(^|\.)music\.126\.net$/i.test(candidate.hostname)) {
        candidate.protocol = 'https:';
        url = candidate.href;
      }
    } catch {}
  }
  return {
    url,
    lyric: words.lrc?.lyric || '',
    translation: words.tlyric?.lyric || '',
    instrumental: words.nolyric === true || /纯音乐[，,]?\s*请欣赏/.test(words.lrc?.lyric || ''),
    // Keep URLs for at most ten minutes; provider links expire.
    expiresAt: Date.now() + (url ? Math.min(600, Math.max(0, Number(stream.expi) - 60 || 0)) : 60) * 1000,
  };
}

module.exports = { resolveMusicTrack };
