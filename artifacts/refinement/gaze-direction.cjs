const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch(),page=await browser.newPage();
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:8080');
 await page.waitForFunction(()=>typeof live2dActiveModel!=='undefined'&&live2dActiveModel?.internalModel);
 console.log(JSON.stringify(await page.evaluate(async()=>{
  const results=[];
  for(const key of Object.keys(live2dModels)){
   await switchLive2dModel(key);
   const c=live2dActiveModel.internalModel.coreModel,d=c._model.drawables;
   c.setParameterValueById('ParamAngleX',0);c.setParameterValueById('ParamAngleY',0);c.setParameterValueById('ParamAngleZ',0);
   c.setParameterValueById('ParamEyeBallX',-1);c._model.update();
   const before=d.vertexPositions.map(v=>Array.from(v));
   c.setParameterValueById('ParamEyeBallX',1);c._model.update();
   const moves=d.vertexPositions.map((v,n)=>{let dx=0;for(let i=0;i<v.length;i+=2)dx+=v[i]-before[n][i];return {id:d.ids[n],dx:dx/(v.length/2)};}).filter(v=>Math.abs(v.dx)>.0001);
   results.push({key,moves});
  }
  return results;
 })));
 await browser.close();
})();
