const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch(),page=await browser.newPage();
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:8080');
 await page.evaluate(()=>applyStyle('apple'));
 const read=()=>page.evaluate(()=>Object.fromEntries(['body','.site-header','.side-nav','.hero','.hero h1','.intro','#projects .card','.site-footer'].map(s=>{
  const c=getComputedStyle(document.querySelector(s));
  return [s,Object.fromEntries(['color','background','padding','fontSize','lineHeight','borderRadius','minHeight'].map(k=>[k,c[k].replaceAll('/launcher/publish/', '/')]))];
 })));
 const current=await read();
 await page.evaluate(async()=>{
  const link=document.querySelector('link[href^="styles.css"]');
  await new Promise(resolve=>{link.onload=resolve;link.href='/launcher/publish/styles.css';});
 });
 const previous=await read();
 const changed=Object.keys(current).filter(s=>JSON.stringify(current[s])!==JSON.stringify(previous[s]));
 console.log(JSON.stringify({changed,details:changed.map(selector=>({selector,current:current[selector],previous:previous[selector]}))}));
 if(changed.length)process.exitCode=1;
 await browser.close();
})();
