const {chromium}=require('playwright'),path=require('path');
(async()=>{
 const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1536,height:960}});
 await page.goto('http://127.0.0.1:8080');
 const colors=await page.evaluate(()=>[...document.querySelectorAll('*')].map(el=>({el,style:getComputedStyle(el)})).filter(({el,style})=>el.getBoundingClientRect().width>0&&style.backgroundColor.match(/^rgb\(/)&&style.backgroundColor.match(/\d+/g).map(Number).every(n=>n<45)).map(({el,style})=>({tag:el.tagName,class:el.className,color:style.backgroundColor})).slice(0,30));
 console.log('Remaining dark UI surfaces:',JSON.stringify(colors));
 for(const [name,target] of [['hero','#hero'],['projects','#projects'],['footer','#page-bottom']]){
  await page.locator(target).scrollIntoViewIfNeeded();await page.waitForTimeout(450);
  await page.screenshot({path:path.join(__dirname,`upscayl-${name}.png`)});
 }
 await page.locator('#music-library summary').click();await page.waitForTimeout(500);
 await page.screenshot({path:path.join(__dirname,'upscayl-music.png')});
 await browser.close();
})();
