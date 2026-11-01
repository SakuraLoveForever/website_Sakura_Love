const { test, expect } = require('@playwright/test');

test('经典短台词按角色记录出处，不混入普通看板娘', async ({ page }) => {
  await page.goto('/');
  const data = await page.evaluate(() => window.live2dCharacterQuotes);
  expect(Object.keys(data.characters).sort()).toEqual(['emilia', 'ram', 'rem']);
  for (const character of Object.values(data.characters)) {
    expect(character.quotes.length).toBeGreaterThanOrEqual(8);
    expect(new Set(character.quotes.map(quote => quote.text)).size).toBe(character.quotes.length);
    for (const quote of character.quotes) {
      expect(quote.text.length).toBeLessThanOrEqual(40);
      expect(quote.episode).toBeGreaterThan(0);
      expect(data.sources[quote.source].startsWith("https://")).toBe(true);
    }
  }
});

test('点击语录跟随实际角色，每轮不重复，原有角色保持原状', async ({ page }) => {
  test.setTimeout(90000);
  await page.addInitScript(() => localStorage.setItem('live2dModel', 'hiyori'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForFunction(() => typeof switchLive2dModel === 'function');
  const result = await page.evaluate(async () => {
    const banks = window.live2dCharacterQuotes.characters;
    const results = [];
    for (const key of ['rem', 'ram', 'emilia']) {
      await switchLive2dModel(key);
      // A pending dropdown selection must not change the visible character's voice.
      live2dModelSelect.value = key === 'rem' ? 'ram' : 'rem';
      const shown = [];
      for (let i = 0; i < banks[key].quotes.length; i++) { showLive2dDialog(); shown.push(live2dDialog.textContent); }
      showLive2dDialog();
      const noBoundaryRepeat = live2dDialog.textContent !== shown[shown.length - 1];
      const character = live2dDialog.dataset.quoteCharacter;
      const source = live2dDialog.dataset.quoteSource;
      showNextLive2dHoverDialog(true);
      const hoverFromSameBank = banks[key].quotes.some(quote => quote.text === live2dDialog.textContent);
      results.push({ key, shown, character, source, noBoundaryRepeat, hoverFromSameBank });
    }
    await switchLive2dModel('hiyori');
    showLive2dDialog();
    const generic = live2dMessages.includes(live2dDialog.textContent);
    const genericHasNoSource = !live2dDialog.dataset.quoteSource;
    showNextLive2dHoverDialog(true);
    const hoverGeneric = live2dHoverMessages.some(message => (typeof message === 'function' ? message() : message) === live2dDialog.textContent);
    showLive2dDialog('自定义问候');
    return { results, generic, genericHasNoSource, hoverGeneric, explicit: live2dDialog.textContent };
  });
  for (const row of result.results) {
    expect(row.character).toBe(row.key);
    expect(new Set(row.shown).size).toBe(row.shown.length);
    expect(row.noBoundaryRepeat).toBe(true);
    expect(row.hoverFromSameBank).toBe(true);
    expect(row.source.startsWith("https://")).toBe(true);
  }
  expect(result.generic).toBe(true);
  expect(result.genericHasNoSource).toBe(true);
  expect(result.hoverGeneric).toBe(true);
  expect(result.explicit).toBe('自定义问候');
});
