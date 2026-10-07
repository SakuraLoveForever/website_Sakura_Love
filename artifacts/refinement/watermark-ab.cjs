const {chromium}=require('playwright'),path=require('path');
(async()=>{
 const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1280,height:800}});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:8080');
 await page.waitForFunction(()=>typeof live2dActiveModel!=='undefined'&&live2dActiveModel?.internalModel);
 for(const value of [0,1]){
  await page.evaluate(v=>{
   const core=live2dActiveModel.internalModel.coreModel;
   core.setParameterValueById('Param261',v);
   core._model.update();
   live2dApp.renderer.render(live2dApp.stage);
  },value);
  await page.locator('#live2d-canvas').screenshot({path:path.join(__dirname,`watermark-current-${value}.png`)});
 }
 console.log(await page.evaluate(()=>({build:document.documentElement.dataset.build,tickerStopped:!live2dApp.ticker.started})));
 await browser.close();
})();
