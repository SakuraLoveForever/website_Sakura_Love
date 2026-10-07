const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1536,height:960}});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>localStorage.setItem('live2dModel','mao'));
 page.on('console',m=>{if(m.type()==='warning')console.log(m.text());});
 await page.goto('http://127.0.0.1:8080');
 await page.waitForFunction(()=>typeof live2dActiveModel!=='undefined'&&live2dActiveModel?.internalModel);
 console.log(await page.evaluate(()=>{const i=live2dActiveModel.internalModel,c=i.coreModel;return {pose:!!i.pose,poseKeys:Object.keys(i.pose||{}),clear:live2dApp.renderer.clearBeforeRender,parts:c._model.parts.ids.map((id,n)=>({id,opacity:c.getPartOpacityByIndex(n)})).filter(p=>/Arm|Wand/.test(p.id))};}));
 await page.locator('#live2d-canvas').screenshot({path:'artifacts/refinement/pose-before.png'});
 console.log(await page.evaluate(()=>{const i=live2dActiveModel.internalModel,c=i.coreModel;return {same:i.pose._lastModel===c,poseUpdate:i.pose.updateParameters.toString(),modelUpdate:live2dActiveModel.update.toString(),internalUpdate:i.update.toString(),ready:live2dActiveModel._deltaTime};}));
 console.log(await page.evaluate(()=>{const i=live2dActiveModel.internalModel,c=i.coreModel;i.update(16,1000);return {groups:i.pose._partGroups,parts:c._model.parts.ids.map((id,n)=>({id,opacity:c.getPartOpacityByIndex(n)})).filter(p=>/Arm|Wand/.test(p.id))};}));
 await page.evaluate(()=>live2dApp.renderer.render(live2dApp.stage));
 await page.locator('#live2d-canvas').screenshot({path:'artifacts/refinement/pose-updated.png'});
 await browser.close();
})();
