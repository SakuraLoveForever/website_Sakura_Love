const {chromium}=require('playwright'),path=require('path');
(async()=>{
 const browser=await chromium.launch(),page=await browser.newPage();
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:8080');
 await page.waitForFunction(()=>typeof live2dActiveModel!=='undefined'&&live2dActiveModel?.internalModel);
 for(const [name,x] of [['left',40],['right',1240]]){
  await page.mouse.move(x,300);await page.waitForTimeout(180);
  await page.locator('#live2d-canvas').screenshot({path:path.join(__dirname,`gaze-${name}.png`)});
 }
 await browser.close();
})();
