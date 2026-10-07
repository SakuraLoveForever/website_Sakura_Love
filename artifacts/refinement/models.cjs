const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const warnings=[];
  page.on('console',msg=>{if(msg.type()==='warning' && msg.text().includes('Live2D')) warnings.push(msg.text());});
  await page.emulateMedia({ reducedMotion:'reduce' });
  await page.goto('http://127.0.0.1:8080');
  await page.waitForFunction(()=> typeof live2dActiveModel !== 'undefined' && live2dActiveModel?.internalModel);
  const results = await page.evaluate(async () => {
    const results=[];
    for (const [key, config] of Object.entries(live2dModels)) {
      await switchLive2dModel(key);
      const b=live2dActiveModel.getBounds();
      results.push({key, loaded:live2dActiveModel.internalModel.settings.url.includes(config.path.split('/').pop()) || live2dActiveModel.internalModel.settings.url===config.path, width:b.width, height:b.height});
    }
    return results;
  });
  console.log(JSON.stringify({results,warnings}));
  if (warnings.length || results.some(r=>!r.loaded||!r.width||!r.height)) process.exitCode=1;
  await browser.close();
})();
