document.documentElement.classList.add("js");
const $=(s)=>document.querySelector(s);
const yearSpan=$("#year"),styleSelect=$("#style-select"),themeToggle=$("#theme-toggle"),designStyleButtons=document.querySelectorAll(".design-style-btn"),layoutModeButtons=document.querySelectorAll(".view-mode-btn"),bgToggle=$("#bg-toggle"),bgCharacterSelect=$("#bg-character-select"),bgPlayModeSelect=$("#bg-play-mode"),musicToggle=$("#music-toggle"),musicVolumeInput=$("#music-volume"),headerMusicNextButton=$("#header-music-next"),pageMuteToggleButton=$("#page-mute-toggle"),animeViewer=$(".anime-viewer"),bgLayerA=$("#bg-layer-a"),bgLayerB=$("#bg-layer-b"),live2dModelSelect=$("#live2d-model"),live2dSizeInput=$("#live2d-size"),live2dSizeValue=$("#live2d-size-value"),live2dSettingsToggle=$("#live2d-settings-toggle"),live2dSettingsPanel=$("#live2d-settings-panel"),hashActionLinks=document.querySelectorAll(".hero-actions a[href^='#'],.side-nav a[href^='#']"),toastRoot=$("#toast-root");
const styleMap={apple:"design-apple",linear:"design-linear"};
const legacyStyleClasses=["style-warm","style-tech","style-minimal","style-melancholy"];
const live2dModels={
  tutu:{name:"草莓兔兔",path:"assets/live2d/tutu/草莓兔兔  试用.model3.json",scale:0.92,watermarkParam:"Param261"},
  mao:{name:"Mao",path:"live2d-widget-v3-main/Resources/model/Mao/Mao.model3.json",scale:0.92},
  hiyori:{name:"Hiyori",path:"live2d-widget-v3-main/Resources/model/Hiyori/Hiyori.model3.json",scale:0.92},
  haru:{name:"Haru",path:"live2d-widget-v3-main/Resources/model/Haru/Haru.model3.json",scale:0.92},
  natori:{name:"Natori",path:"live2d-widget-v3-main/Resources/model/Natori/Natori.model3.json",scale:0.92,hiddenParts:["PartCredit"]},
  mark:{name:"Mark",path:"live2d-widget-v3-main/Resources/model/Mark/Mark.model3.json",scale:0.92}
};
const live2dCdnBase="https://cdn.jsdelivr.net/gh/SakuraLoveForever/website_Sakura_Love@main/";
const live2dFileMode=window.location.protocol==="file:";
const live2dDefaultModel=live2dFileMode?"hiyori":"tutu";
const getLive2dModelKey=(key)=>live2dModels[key]?(live2dFileMode&&key==="tutu"?live2dDefaultModel:key):live2dDefaultModel;
const live2dCdnUrl=(path)=>live2dCdnBase+path.split("/").map(encodeURIComponent).join("/");
const live2dModelSources=(config)=>live2dFileMode?[live2dCdnUrl(config.path)]:[config.path,live2dCdnUrl(config.path)];
const loadLive2dModel=async(config)=>{
  let lastError=null;
  for(const source of live2dModelSources(config)){
    try{return await PIXI.live2d.Live2DModel.from(source)}
    catch(error){lastError=error;console.warn("Live2D model source failed:",source,error)}
  }
  throw lastError;
};
const live2dFocusParams={angleX:"ParamAngleX",angleY:"ParamAngleY",angleZ:"ParamAngleZ",bodyAngleX:"ParamBodyAngleX",bodyAngleY:"ParamBodyAngleY",bodyAngleZ:"ParamBodyAngleZ",eyeBallX:"ParamEyeBallX",eyeBallY:"ParamEyeBallY",mouseX:"Param83",mouseY:"Param84"};
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
const names={"02":"02",chitanda:"千反田爱瑠",kaguya:"辉夜姬",yachiyo:"八千代",iroha:"彩叶",eriyi:"绘梨衣",elaina:"伊雷娜",chtholly:"珂朵莉",sora:"春日野穹",akame:"赤瞳",mine:"玛茵",esdeath:"艾斯德斯",krul:"克鲁鲁",shinoa:"柊筱娅",violet:"薇尔莉特",toki:"蝶祈"};
const bgFiles={
  "02":["1.jpg","2.jpg"],
  chitanda:["1.jpg","2.jpg","3.jpg"],
  kaguya:["1.jpg"],
  yachiyo:["1.jpg","2.jpg","3.jpg","4.jpg"],
  iroha:["1.jpg","2.jpg"],
  eriyi:["1.jpg"],
  elaina:["1.jpg","2.jpg","3.jpg","4.jpg"],
  chtholly:["1.jpg"],
  sora:["1.jpg"],
  akame:["1.jpg"],
  mine:["1.jpg","2.jpg","3.jpg"],
  esdeath:["1.jpg","2.jpg","3.jpg","4.jpg"],
  krul:["1.jpg","2.jpg","3.jpg","4.jpg"],
  shinoa:["1.jpg","2.jpg","3.jpg","4.jpg"],
  violet:["2.jpg","3.jpg","5.jpg","6.jpg","7.jpg"],
  toki:["1.jpg","2.jpg","3.jpg","4.jpg","5.jpg","6.jpg"]
};
const bgRoleOrder=["02","akame","chitanda","chtholly","elaina","eriyi","esdeath","iroha","kaguya","krul","mine","shinoa","sora","toki","violet","yachiyo"].filter(role=>bgFiles[role]?.length);
const bgCount=Object.fromEntries(Object.entries(bgFiles).map(([role,files])=>[role,files.length]));
const musicCount={"02":4,chitanda:2,kaguya:1,yachiyo:1,iroha:1,eriyi:2,elaina:1,chtholly:1,sora:3,akame:4,mine:4,esdeath:4,krul:1,shinoa:1,violet:4,toki:4};
let bgPlayMode=localStorage.getItem("bgPlayMode")||"single",activeBgLayer=bgLayerA,bgTimer=null,currentRole=localStorage.getItem("bgCharacter")||"02",isPageMuted=localStorage.getItem("pageMuted")==="true",musicEnabled=localStorage.getItem("musicEnabled")!=="false";
const bgSeq={},musicSeq={},player=new Audio();
player.loop=false;player.preload="auto";player.volume=Math.min(1,Math.max(0,Number(localStorage.getItem("musicVolume"))||0.6));player.muted=isPageMuted;
const isViewerEnabled=()=>true;
const showToast=(message)=>{if(!toastRoot)return;const toast=document.createElement("div");toast.className="toast";toast.textContent=message;toastRoot.appendChild(toast);setTimeout(()=>toast.remove(),3100)};
const fit=(el)=>{if(!el)return;const n=Math.max(4,...Array.from(el.options||[]).map(o=>(o.textContent||"").trim().length));el.style.width=`calc(${n}ch + 3.2rem)`};
const applyStyle=(k)=>{const safe=styleMap[k]?k:"apple";document.body.classList.remove(...Object.values(styleMap),...legacyStyleClasses);document.body.classList.add(styleMap[safe]);designStyleButtons.forEach(button=>{const active=button.dataset.designStyle===safe;button.classList.toggle("active",active);button.setAttribute("aria-pressed",String(active))});if(styleSelect)styleSelect.value=safe;localStorage.setItem("stylePreset",safe)};
const applyTheme=(mode)=>{const dark=mode==="dark";document.body.classList.toggle("theme-dark",dark);if(themeToggle)themeToggle.setAttribute("aria-pressed",String(dark));localStorage.setItem("themeMode",dark?"dark":"light")};
const applyLayoutMode=(mode)=>{const safe=mode==="mobile"?"mobile":"desktop";document.body.classList.toggle("layout-mobile",safe==="mobile");layoutModeButtons.forEach(button=>{const active=button.dataset.layoutMode===safe;button.classList.toggle("active",active);button.setAttribute("aria-pressed",String(active))});localStorage.setItem("layoutMode",safe)};
const setBg=(role)=>{if(!bgLayerA||!bgLayerB)return;const r=bgFiles[role]?.length?role:"02",files=bgFiles[r],idx=(bgSeq[r]||0)%files.length;bgSeq[r]=(bgSeq[r]||0)+1;currentRole=r;if(bgCharacterSelect)bgCharacterSelect.value=r;localStorage.setItem("bgCharacter",r);const next=activeBgLayer===bgLayerA?bgLayerB:bgLayerA;next.style.backgroundImage=`url("assets/backgrounds/${r}/${files[idx]}")`;next.classList.add("visible");if(activeBgLayer)activeBgLayer.classList.remove("visible");activeBgLayer=next};
const nextRole=()=>{const start=bgRoleOrder.indexOf(currentRole);return bgRoleOrder[(start+1+bgRoleOrder.length)%bgRoleOrder.length]||"02"};
const nextSceneRole=(role=currentRole)=>bgPlayMode==="all"?nextRole():(bgCount[role]?role:"02");
const playRole=(role)=>{if(!musicEnabled)return;const r=musicCount[role]?role:"02",count=musicCount[r],idx=((musicSeq[r]||0)%count)+1;musicSeq[r]=(musicSeq[r]||0)+1;player.src=`assets/music/${r}/${idx}.mp3`;player.play().catch(()=>{})};
const showScene=(role,{withMusic=false}={})=>{const r=bgCount[role]?role:"02";setBg(r);if(withMusic)playRole(r)};
const scheduleBgOnly=()=>{clearInterval(bgTimer);if(!musicEnabled)bgTimer=setInterval(()=>showScene(nextSceneRole()),3000)};
const applyBg=(on,role)=>{clearInterval(bgTimer);if(animeViewer)animeViewer.classList.toggle("is-viewer-off",!on);if(!bgLayerA||!bgLayerB)return;if(!on){player.pause();bgLayerA.classList.remove("visible");bgLayerB.classList.remove("visible");bgLayerA.style.backgroundImage="";bgLayerB.style.backgroundImage="";return}showScene(role,{withMusic:musicEnabled});scheduleBgOnly()};
const playNext=()=>{if(!isViewerEnabled())return;const role=nextSceneRole(bgCharacterSelect?bgCharacterSelect.value:"02");showScene(role,{withMusic:musicEnabled})};
const updateMusicButtonState=()=>{if(!pageMuteToggleButton)return;const active=Boolean(player.src)&&!player.paused&&!isPageMuted;pageMuteToggleButton.classList.toggle("is-playing",active);pageMuteToggleButton.classList.toggle("muted",isPageMuted||!active);pageMuteToggleButton.title=isPageMuted?"取消静音":"静音"};
const progress=()=>{if(!pageMuteToggleButton)return;const d=Number(player.duration),t=Number(player.currentTime),p=d>0?Math.min(1,Math.max(0,t/d)):0;pageMuteToggleButton.style.setProperty("--play-progress",`${p*360}deg`);updateMusicButtonState()};
const controls=()=>updateMusicButtonState();
const playModeUI=()=>{if(bgCharacterSelect)bgCharacterSelect.disabled=bgPlayMode!=="single";if(headerMusicNextButton)headerMusicNextButton.title=bgPlayMode==="single"?"切歌":"切角色"};
applyStyle(localStorage.getItem("stylePreset")||"apple");applyTheme(localStorage.getItem("themeMode")==="dark"?"dark":"light");applyLayoutMode(localStorage.getItem("layoutMode")||"desktop");controls();playModeUI();
const bgOn=true,bgRole=localStorage.getItem("bgCharacter")||"02";localStorage.setItem("bgEnabled","true");if(bgToggle)bgToggle.checked=bgOn;if(bgCharacterSelect)bgCharacterSelect.value=bgCount[bgRole]?bgRole:"02";if(bgPlayModeSelect)bgPlayModeSelect.value=bgPlayMode;applyBg(bgOn,bgRole);
if(musicToggle)musicToggle.checked=musicEnabled;if(musicVolumeInput){musicVolumeInput.value=String(Math.round(player.volume*100));musicVolumeInput.style.setProperty("--vol",`${Math.round(player.volume*100)}%`)}[styleSelect,bgCharacterSelect,bgPlayModeSelect,live2dModelSelect].forEach(fit);
designStyleButtons.forEach(button=>button.addEventListener("click",()=>{applyStyle(button.dataset.designStyle);showToast("风格已更新")}));
if(styleSelect)styleSelect.addEventListener("change",e=>{applyStyle(e.target.value);fit(styleSelect);showToast("风格已更新")});
if(themeToggle)themeToggle.addEventListener("click",()=>{const dark=!document.body.classList.contains("theme-dark");applyTheme(dark?"dark":"light");showToast(dark?"夜间模式已开启":"夜间模式已关闭")});
layoutModeButtons.forEach(button=>button.addEventListener("click",()=>{const mode=button.dataset.layoutMode==="mobile"?"mobile":"desktop";applyLayoutMode(mode);if(mode==="desktop")requestAnimationFrame(()=>requestAnimationFrame(()=>{if(typeof applyLive2dSettings==="function")applyLive2dSettings()}));showToast(mode==="mobile"?"已切换移动端布局":"已切换网页端布局")}));
if(bgCharacterSelect)bgCharacterSelect.addEventListener("change",e=>{localStorage.setItem("bgCharacter",e.target.value);applyBg(true,e.target.value);showToast("欣赏角色已切换")});
if(bgPlayModeSelect)bgPlayModeSelect.addEventListener("change",e=>{bgPlayMode=e.target.value==="all"?"all":"single";localStorage.setItem("bgPlayMode",bgPlayMode);playModeUI();applyBg(true,bgCharacterSelect?bgCharacterSelect.value:"02");showToast("播放模式已更新")});
if(musicToggle)musicToggle.addEventListener("change",()=>{musicEnabled=musicToggle.checked;localStorage.setItem("musicEnabled",String(musicEnabled));if(musicEnabled){clearInterval(bgTimer);if(isViewerEnabled())showScene(currentRole,{withMusic:true})}else{player.pause();scheduleBgOnly()}showToast(musicEnabled?"音乐已开启":"音乐已关闭")});
if(musicVolumeInput)musicVolumeInput.addEventListener("input",()=>{const v=Math.min(100,Math.max(0,Number(musicVolumeInput.value)||0));player.volume=v/100;localStorage.setItem("musicVolume",String(player.volume));musicVolumeInput.style.setProperty("--vol",`${v}%`)});
if(live2dModelSelect)live2dModelSelect.addEventListener("change",()=>{const modelKey=getLive2dModelKey(live2dModelSelect.value);localStorage.setItem("live2dModel",modelKey);if(typeof switchLive2dModel==="function")switchLive2dModel(modelKey);showToast("看板娘角色已切换")});
if(live2dSizeInput)live2dSizeInput.addEventListener("input",()=>{const size=Math.min(160,Math.max(60,Number(live2dSizeInput.value)||100));localStorage.setItem("live2dSize",String(size));applyLive2dSettings()});
if(headerMusicNextButton)headerMusicNextButton.addEventListener("click",()=>{playNext();showToast(bgPlayMode==="single"?"歌曲已切换":"角色已切换")});
if(pageMuteToggleButton)pageMuteToggleButton.addEventListener("click",()=>{isPageMuted=!isPageMuted;player.muted=isPageMuted;localStorage.setItem("pageMuted",String(isPageMuted));controls();showToast(isPageMuted?"已静音":"已取消静音")});
player.addEventListener("timeupdate",progress);player.addEventListener("play",updateMusicButtonState);player.addEventListener("pause",updateMusicButtonState);player.addEventListener("ended",()=>{updateMusicButtonState();playNext()});
if(yearSpan)yearSpan.textContent=String(new Date().getFullYear());
const glowButtons=document.querySelectorAll(".hero-actions .btn,.project-title-btn,.social-links a,.jump-btn");
const updateButtonEdgeGlow=(button,event)=>{
  const rect=button.getBoundingClientRect();
  const x=event.clientX-rect.left;
  const y=event.clientY-rect.top;
  const label=button.querySelector(".glow-label");
  const labelRect=label?label.getBoundingClientRect():rect;
  const textX=event.clientX-labelRect.left;
  const textY=event.clientY-labelRect.top;
  button.style.setProperty("--button-x",`${x.toFixed(2)}px`);
  button.style.setProperty("--button-y",`${y.toFixed(2)}px`);
  button.style.setProperty("--text-x",`${textX.toFixed(2)}px`);
  button.style.setProperty("--text-y",`${textY.toFixed(2)}px`);
  button.classList.add("edge-glowing");
};
glowButtons.forEach(button=>{
  if(!button.querySelector(".glow-label")){
    const label=document.createElement("span");
    label.className="glow-label";
    while(button.firstChild)label.appendChild(button.firstChild);
    button.appendChild(label);
  }
  button.addEventListener("pointermove",event=>updateButtonEdgeGlow(button,event),{passive:true});
  button.addEventListener("mousemove",event=>updateButtonEdgeGlow(button,event),{passive:true});
  button.addEventListener("pointerleave",()=>button.classList.remove("edge-glowing"));
  button.addEventListener("mouseleave",()=>button.classList.remove("edge-glowing"));
});
const revealTargets=document.querySelectorAll(".section,.card,.about-panel,.about-sub-panel,.chips li,.side-nav,.site-footer");
if("IntersectionObserver" in window){
  const revealObserver=new IntersectionObserver((entries,observer)=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.classList.add("is-revealed");observer.unobserve(entry.target)})},{threshold:0.12,rootMargin:"0px 0px -8% 0px"});
  revealTargets.forEach((el,index)=>{el.classList.add("reveal-on-scroll");el.style.transitionDelay=`${Math.min(index%6*45,220)}ms`;revealObserver.observe(el)});
}else{
  revealTargets.forEach(el=>el.classList.add("is-revealed"));
}
const live2dCanvas=$("#live2d-canvas"),live2dWidget=$("#live2d-widget"),live2dDialog=$("#live2d-dialog");
let live2dSettingsTimer=null,live2dControlsActive=false,live2dLayoutFrame=0;
const queueLive2dFrame=window.requestAnimationFrame?.bind(window)||((callback)=>setTimeout(callback,16));
const isLive2dSettingsTarget=(target)=>Boolean(target?.closest?.(".live2d-settings-toggle,.live2d-settings-panel"));
const markLive2dControlsActive=()=>{live2dControlsActive=true};
const unmarkLive2dControlsActive=()=>{live2dControlsActive=false};
const hideLive2dSettingsButton=()=>{
  if(!live2dWidget||live2dWidget.classList.contains("live2d-settings-open"))return;
  live2dWidget.classList.remove("live2d-settings-visible");
};
const showLive2dSettingsButton=({keep=false}={})=>{
  if(!live2dWidget)return;
  live2dWidget.classList.add("live2d-settings-visible");
  clearTimeout(live2dSettingsTimer);
  if(!keep)live2dSettingsTimer=setTimeout(hideLive2dSettingsButton,3000);
};
const setLive2dSettingsOpen=(open)=>{
  if(!live2dWidget)return;
  live2dWidget.classList.toggle("live2d-settings-open",open);
  if(live2dSettingsToggle)live2dSettingsToggle.setAttribute("aria-expanded",String(open));
  showLive2dSettingsButton({keep:open});
  if(!open){unmarkLive2dControlsActive();live2dSettingsTimer=setTimeout(hideLive2dSettingsButton,3000)}
};
if(live2dSettingsToggle)live2dSettingsToggle.addEventListener("click",e=>{
  e.stopPropagation();
  setLive2dSettingsOpen(!live2dWidget?.classList.contains("live2d-settings-open"));
});
if(live2dSettingsPanel){
  live2dSettingsPanel.addEventListener("click",e=>e.stopPropagation());
  live2dSettingsPanel.addEventListener("pointerdown",markLive2dControlsActive);
  live2dSettingsPanel.addEventListener("focusin",markLive2dControlsActive);
  live2dSettingsPanel.addEventListener("focusout",()=>setTimeout(()=>{if(!live2dSettingsPanel.contains(document.activeElement))unmarkLive2dControlsActive()},0));
  live2dSettingsPanel.addEventListener("input",markLive2dControlsActive);
}
window.addEventListener("pointerup",unmarkLive2dControlsActive,{passive:true});
window.addEventListener("pointercancel",unmarkLive2dControlsActive,{passive:true});
document.addEventListener("pointerdown",e=>{
  if(!live2dWidget||!live2dWidget.classList.contains("live2d-settings-visible")&&!live2dWidget.classList.contains("live2d-settings-open"))return;
  if(live2dWidget.contains(e.target))return;
  clearTimeout(live2dSettingsTimer);
  unmarkLive2dControlsActive();
  live2dWidget.classList.remove("live2d-settings-open","live2d-settings-visible");
  if(live2dSettingsToggle)live2dSettingsToggle.setAttribute("aria-expanded","false");
},true);
const live2dMessages=["好久不见，日子过得好快呢……","大坏蛋！你都多久没理人家了呀，嘤嘤嘤～","嗨～快来逗我玩吧！","拿小拳拳锤你胸口！","记得把小家加入收藏夹哦！","今天也要元气满满。","别戳啦，我在认真看家。","要不要听一首歌放松一下？","角色窗口和音乐现在会一起换啦。","欢迎来到 Sakura_Love 的小窝。","偷偷告诉你，点击页面也有惊喜。","哼，你刚刚是不是又在偷看我？","要摸头的话……只能一下下哦。","今天也要陪我玩一会儿嘛。"];
const getCurrentLive2dName=()=>{
  const selected=getLive2dModelKey(live2dModelSelect&&live2dModels[live2dModelSelect.value]?live2dModelSelect.value:localStorage.getItem("live2dModel"));
  return live2dModels[selected]?.name||"看板娘";
};
const live2dHoverMessages=["干嘛呢你，快把手拿开～～","鼠…鼠标放错地方了！","你要干嘛呀？","喵喵喵？","怕怕(ノ≧∇≦)ノ","非礼呀！救命！","这样的话，只能使用武力了！","我要生气了哦","不要动手动脚的！","真…真的是不知羞耻！",()=>`${getCurrentLive2dName()}！`,"拿小拳拳锤你胸口！","嗨~快来逗我玩吧！","真……真的是不知羞耻！","再摸的话我可要报警了！","不要摸我了，我要叫我老婆来打你了！","是…是不小心碰到了吧…","干嘛碰我呀，小心我咬你！","哼，再靠近一点试试看？","你、你不要突然凑这么近啦！"];
const clickTexts=["是…是不小心碰到了吧…","萝莉控是什么呀？","你看到我的小熊了吗？","再摸的话我可要报警了！⌇●﹏●⌇","110 吗，这里有个变态一直在摸我(ó﹏ò｡)","不要摸我了，我会告诉老婆来打你的！","干嘛动我呀！小心我咬你！","别摸我，有什么好摸的！","樱花落下的速度，是每秒五厘米。","愿你所到之处，遍地温柔。","今天也辛苦啦。","把热爱写进每一天。","风会带来新的故事。","愿所有长夜都有星光。","保持可爱，也保持锋芒。","世界很大，慢慢相遇。"];
let live2dHoverIndex=0,lastLive2dHoverAt=0,live2dHovering=false,live2dHoverExitTimer=null,dialogTimer=null,siteWasHidden=false,live2dReturnMessage="哇，你终于回来了~";
const sanitizeWaifuText=(text)=>{
  if(typeof text!=="string")return "";
  const clean=text.trim();
  return /<[^>]*>|\{[^}]*\}/.test(clean)?"":clean;
};
const pick=(arr)=>arr[Math.floor(Math.random()*arr.length)];
const showLive2dDialog=(text=pick(live2dMessages))=>{if(!live2dDialog)return;const clean=sanitizeWaifuText(text)||pick(live2dMessages);clearTimeout(dialogTimer);live2dDialog.textContent=clean;live2dDialog.classList.add("visible");dialogTimer=setTimeout(()=>live2dDialog.classList.remove("visible"),2600)};
const showNextLive2dHoverDialog=(force=false)=>{const now=Date.now();if(!force&&now-lastLive2dHoverAt<350)return;lastLive2dHoverAt=now;const message=live2dHoverMessages[live2dHoverIndex++%live2dHoverMessages.length];showLive2dDialog(typeof message==="function"?message():message)};
const showClickText=(x,y,text=pick(clickTexts))=>{const clean=sanitizeWaifuText(text)||pick(clickTexts);const el=document.createElement("span");el.className="click-pop-text";el.textContent=clean;const safeX=Math.min(window.innerWidth-16,Math.max(16,x));const safeY=Math.min(window.innerHeight-16,Math.max(16,y));el.style.left=`${safeX}px`;el.style.top=`${safeY}px`;document.body.appendChild(el);el.addEventListener("animationend",()=>el.remove(),{once:true})};
let live2dRelayout=null;
let switchLive2dModel=null;
const scheduleLive2dRelayout=()=>{
  if(typeof live2dRelayout!=="function")return;
  if(live2dLayoutFrame)return;
  live2dLayoutFrame=queueLive2dFrame(()=>{
    live2dLayoutFrame=0;
    if(typeof live2dRelayout==="function")live2dRelayout();
  });
};
const isAroundLive2dWidget=(event,{wide=false}={})=>{
  if(!live2dWidget)return false;
  const rect=live2dWidget.getBoundingClientRect();
  const padX=wide?Math.max(180,rect.width*0.8):Math.max(80,rect.width*0.32);
  const padTop=wide?100:56;
  const padBottom=wide?150:90;
  return event.clientX>=rect.left-padX&&event.clientX<=rect.right+padX&&event.clientY>=rect.top-padTop&&event.clientY<=rect.bottom+padBottom;
};
const applyLive2dSettings=()=>{
  if(!live2dWidget)return;
  const modelKey=getLive2dModelKey(localStorage.getItem("live2dModel"));
  const size=Math.min(160,Math.max(60,Number(localStorage.getItem("live2dSize"))||100));
  const rawX=localStorage.getItem("live2dX"),rawY=localStorage.getItem("live2dY");
  const savedX=Number(rawX),savedY=Number(rawY);
  const hasCustomPosition=localStorage.getItem("live2dCustomPosition")==="true"&&rawX!==null&&rawY!==null&&Number.isFinite(savedX)&&Number.isFinite(savedY);
  live2dWidget.classList.toggle("live2d-custom-position",hasCustomPosition);
  live2dWidget.style.setProperty("--live2d-size",String(size/100));
  if(hasCustomPosition){
    const nextX=`${Math.min(window.innerWidth-live2dWidget.offsetWidth,Math.max(0,savedX))}px`;
    const nextY=`${Math.min(window.innerHeight-live2dWidget.offsetHeight,Math.max(0,savedY))}px`;
    live2dWidget.style.setProperty("--live2d-x",nextX);
    live2dWidget.style.setProperty("--live2d-y",nextY);
    live2dWidget.style.setProperty("--live2d-bottom","auto");
    live2dWidget.style.left=nextX;
    live2dWidget.style.top=nextY;
    live2dWidget.style.bottom="auto";
    live2dWidget.style.right="auto";
  }else{
    const left="8px";
    live2dWidget.style.setProperty("--live2d-x",left);
    live2dWidget.style.setProperty("--live2d-y","auto");
    live2dWidget.style.setProperty("--live2d-bottom","0");
    live2dWidget.style.left=left;
    live2dWidget.style.top="auto";
    live2dWidget.style.right="auto";
    live2dWidget.style.bottom="0";
  }
  if(live2dModelSelect)live2dModelSelect.value=modelKey;
  if(live2dSizeInput)live2dSizeInput.value=String(size);
  if(live2dSizeValue)live2dSizeValue.textContent=`${size}%`;
  scheduleLive2dRelayout();
};
applyLive2dSettings();
const initLive2d=async()=>{
  if(!live2dCanvas||!live2dWidget)return;
  if(!window.PIXI||!window.PIXI.live2d||!window.PIXI.live2d.Live2DModel){
    console.warn("Live2D loader is not ready. Check CDN scripts.");
    return;
  }
  try{
    const app=new PIXI.Application({view:live2dCanvas,autoStart:true,transparent:true,backgroundAlpha:0,width:live2dWidget.clientWidth,height:live2dWidget.clientHeight,antialias:true,resolution:window.devicePixelRatio||1,autoDensity:true,preserveDrawingBuffer:true});
    let model=null,modelConfig=null,naturalWidth=0,naturalHeight=0,loadToken=0,manualFocusPoint={nx:0,ny:0};
    const setModelParameter=(id,value)=>{
      const coreModel=model?.internalModel?.coreModel;
      if(!id||!coreModel)return;
      try{
        if(typeof coreModel.getParameterIndex==="function"){
          const index=coreModel.getParameterIndex(id);
          if(index<0)return;
          if(typeof coreModel.setParameterValueByIndex==="function"){
            coreModel.setParameterValueByIndex(index,value);
            return;
          }
        }
        if(typeof coreModel.setParameterValueById==="function")coreModel.setParameterValueById(id,value);
      }catch{
        return;
      }
    };
    const getModelIdText=(handle)=>{
      if(typeof handle==="string")return handle;
      const raw=handle?.getString?.();
      if(typeof raw==="string")return raw;
      if(typeof raw?.s==="string")return raw.s;
      if(typeof handle?._id?.s==="string")return handle._id.s;
      return "";
    };
    const findModelPartIndex=(coreModel,id)=>{
      const count=typeof coreModel.getPartCount==="function"?coreModel.getPartCount():coreModel?._model?.parts?.ids?.length||0;
      const partIds=coreModel?._partIds;
      const rawIds=coreModel?._model?.parts?.ids;
      for(let index=0;index<count;index+=1){
        const partId=partIds?.at?.(index)||rawIds?.[index];
        if(partId===id||partId?.isEqual?.(id)||getModelIdText(partId)===id)return index;
      }
      try{
        if(typeof coreModel.getPartIndex==="function"){
          const index=coreModel.getPartIndex(id);
          if(index>=0&&index<count)return index;
        }
      }catch{}
      return -1;
    };
    const setModelPartOpacity=(id,value)=>{
      const coreModel=model?.internalModel?.coreModel;
      if(!id||!coreModel)return;
      try{
        const index=findModelPartIndex(coreModel,id);
        if(index>=0&&typeof coreModel.setPartOpacityByIndex==="function"){
          coreModel.setPartOpacityByIndex(index,value);
          return;
        }
        if(typeof coreModel.setPartOpacityById==="function")coreModel.setPartOpacityById(id,value);
      }catch{
        return;
      }
    };
    let watermarkHidden=true;
    const hideConfiguredModelMarks=()=>{
      if(modelConfig?.watermarkParam)setModelParameter(modelConfig.watermarkParam,watermarkHidden?1:0);
      (modelConfig?.hiddenParts||[]).forEach(partId=>setModelPartOpacity(partId,0));
    };
    const setManualFocusFromEvent=(event)=>{
      const rect=live2dWidget.getBoundingClientRect();
      if(!rect.width||!rect.height)return;
      const centerX=rect.left+rect.width*0.5;
      const centerY=rect.top+rect.height*0.38;
      const reachX=Math.max(90,Math.min(window.innerWidth*0.28,rect.width*0.72));
      const reachY=Math.max(64,Math.min(window.innerHeight*0.18,rect.height*0.24));
      manualFocusPoint={
        nx:clamp((event.clientX-centerX)/reachX,-1,1),
        ny:clamp((event.clientY-centerY)/reachY,-1,1)
      };
      applyManualFocus();
    };
    const applyManualFocus=()=>{
      const focusParams=modelConfig?.focusParams||live2dFocusParams;
      const {nx,ny}=manualFocusPoint;
      setModelParameter(focusParams.angleX,clamp(nx*42,-42,42));
      setModelParameter(focusParams.angleY,clamp(-ny*52,-52,52));
      setModelParameter(focusParams.angleZ,clamp(-nx*10,-10,10));
      setModelParameter(focusParams.bodyAngleX,clamp(nx*16,-16,16));
      setModelParameter(focusParams.bodyAngleY,clamp(-ny*12,-12,12));
      setModelParameter(focusParams.bodyAngleZ,clamp(-nx*8,-8,8));
      setModelParameter(focusParams.eyeBallX,clamp(nx*1.55,-1.55,1.55));
      setModelParameter(focusParams.eyeBallY,clamp(-ny*2.2,-2.2,2.2));
      setModelParameter(focusParams.mouseX,clamp(nx,-1,1));
      setModelParameter(focusParams.mouseY,clamp(-ny,-1,1));
    };
    const updateLive2dDialogAnchor=()=>{
      const w=live2dWidget.clientWidth,h=live2dWidget.clientHeight;
      if(!model||!w||!h)return;
      let x=w*0.5,y=h*0.18;
      try{
        const bounds=model.getBounds?.();
        if(bounds&&Number.isFinite(bounds.x)&&Number.isFinite(bounds.y)&&bounds.width>0&&bounds.height>0){
          x=clamp(bounds.x+bounds.width*0.5,36,w-36);
          y=clamp(bounds.y,48,h-8);
        }
      }catch{}
      live2dWidget.style.setProperty("--live2d-dialog-x",`${x}px`);
      live2dWidget.style.setProperty("--live2d-dialog-y",`${y}px`);
    };
    app.ticker.add(()=>{hideConfiguredModelMarks();applyManualFocus();updateLive2dDialogAnchor()},undefined,-100);
    const layout=()=>{
      const w=live2dWidget.clientWidth,h=live2dWidget.clientHeight;
      if(!model||!w||!h||!naturalWidth||!naturalHeight)return;
      app.renderer.resize(w,h);
      const scale=Math.min(w/naturalWidth,h/naturalHeight)*(modelConfig.scale||0.92);
      model.scale.set(scale,scale);
      model.anchor.set(0.5,1);
      model.position.set(w*0.5,h*0.98);
      updateLive2dDialogAnchor();
    };
    live2dRelayout=layout;
    switchLive2dModel=async(modelKey)=>{
      const safeKey=getLive2dModelKey(modelKey);
      const nextConfig=live2dModels[safeKey];
      const token=++loadToken;
      live2dWidget.classList.remove("live2d-hidden");
      try{
        const nextModel=await loadLive2dModel(nextConfig);
        if(token!==loadToken){nextModel.destroy?.();return}
        if(model){app.stage.removeChild(model);model.destroy?.()}
        model=nextModel;
        modelConfig=nextConfig;
        naturalWidth=model.width;
        naturalHeight=model.height;
        app.stage.addChild(model);
        hideConfiguredModelMarks();
        applyLive2dSettings();
        layout();
        if(live2dModelSelect)live2dModelSelect.value=safeKey;
      }catch(err){
        if(token===loadToken)live2dWidget.classList.add("live2d-hidden");
        console.warn("Live2D model load failed:",err);
      }
    };
    window.addEventListener("keydown",e=>{
      if(e.ctrlKey&&e.shiftKey){
        watermarkHidden=!watermarkHidden;
        hideConfiguredModelMarks();
      }
    });
    window.addEventListener("resize",applyLive2dSettings);
    window.addEventListener("pointermove",e=>{
      if(!model)return;
      if(live2dControlsActive||isLive2dSettingsTarget(e.target))return;
      setManualFocusFromEvent(e);
      const inLive2dZone=isAroundLive2dWidget(e);
      if(inLive2dZone&&!live2dHovering){
        clearTimeout(live2dHoverExitTimer);
        live2dHoverExitTimer=null;
        live2dHovering=true;
        showNextLive2dHoverDialog(true);
      }else if(!inLive2dZone&&live2dHovering){
        clearTimeout(live2dHoverExitTimer);
        live2dHoverExitTimer=null;
        live2dHovering=false;
      }
    },{passive:true});
    const hitLive2dPixel=(event)=>{
      const rect=live2dCanvas.getBoundingClientRect();
      if(!rect.width||!rect.height)return false;
      const x=Math.floor((event.clientX-rect.left)/rect.width*app.renderer.width);
      const y=Math.floor((event.clientY-rect.top)/rect.height*app.renderer.height);
      if(x<0||y<0||x>=app.renderer.width||y>=app.renderer.height)return false;
      try{
        const pixels=app.renderer.extract.pixels(app.stage);
        const radius=Math.max(3,Math.ceil(Math.min(app.renderer.width,app.renderer.height)*0.012));
        for(let dy=-radius;dy<=radius;dy+=2){
          for(let dx=-radius;dx<=radius;dx+=2){
            const px=x+dx,py=y+dy;
            if(px>=0&&py>=0&&px<app.renderer.width&&py<app.renderer.height&&pixels[(py*app.renderer.width+px)*4+3]>24)return true;
          }
        }
        return false;
      }catch{
        return true;
      }
    };
    let live2dDragged=false,draggingLive2d=false,suppressLive2dClick=false,dragOffsetX=0,dragOffsetY=0,dragStartX=0,dragStartY=0;
    const moveLive2dTo=(x,y,{save=false}={})=>{
      const maxX=Math.max(0,window.innerWidth-live2dWidget.offsetWidth);
      const maxY=Math.max(0,window.innerHeight-live2dWidget.offsetHeight);
      const nextX=Math.min(maxX,Math.max(0,x));
      const nextY=Math.min(maxY,Math.max(0,y));
      live2dWidget.classList.add("live2d-custom-position");
      live2dWidget.style.setProperty("--live2d-x",`${nextX}px`);
      live2dWidget.style.setProperty("--live2d-y",`${nextY}px`);
      live2dWidget.style.setProperty("--live2d-bottom","auto");
      live2dWidget.style.left=`${nextX}px`;
      live2dWidget.style.top=`${nextY}px`;
      live2dWidget.style.bottom="auto";
      live2dWidget.style.right="auto";
      if(save){localStorage.setItem("live2dCustomPosition","true");localStorage.setItem("live2dX",String(nextX));localStorage.setItem("live2dY",String(nextY))}
      if(typeof live2dRelayout==="function")live2dRelayout();
    };
    const beginLive2dDrag=(e)=>{
      if(isLive2dSettingsTarget(e.target))return;
      if(!hitLive2dPixel(e))return;
      const rect=live2dWidget.getBoundingClientRect();
      draggingLive2d=true;
      live2dDragged=false;
      suppressLive2dClick=false;
      dragStartX=e.clientX;
      dragStartY=e.clientY;
      dragOffsetX=e.clientX-rect.left;
      dragOffsetY=e.clientY-rect.top;
      live2dWidget.classList.add("dragging");
      try{live2dWidget.setPointerCapture(e.pointerId)}catch{}
      e.preventDefault();
    };
    live2dWidget.addEventListener("pointerdown",beginLive2dDrag);
    const handleLive2dDragMove=(e)=>{
      if(!draggingLive2d)return;
      if(!live2dDragged&&Math.hypot(e.clientX-dragStartX,e.clientY-dragStartY)<=3)return;
      live2dDragged=true;
      moveLive2dTo(e.clientX-dragOffsetX,e.clientY-dragOffsetY);
    };
    live2dWidget.addEventListener("pointermove",handleLive2dDragMove);
    document.addEventListener("pointermove",handleLive2dDragMove);
    const endLive2dDrag=()=>{draggingLive2d=false;live2dWidget.classList.remove("dragging")};
    const handleLive2dDragEnd=(e)=>{
      if(!draggingLive2d)return;
      suppressLive2dClick=live2dDragged;
      if(live2dDragged)moveLive2dTo(e.clientX-dragOffsetX,e.clientY-dragOffsetY,{save:true});
      endLive2dDrag();
      try{live2dWidget.releasePointerCapture(e.pointerId)}catch{}
    };
    live2dWidget.addEventListener("pointerup",handleLive2dDragEnd);
    document.addEventListener("pointerup",handleLive2dDragEnd);
    live2dWidget.addEventListener("pointercancel",endLive2dDrag);
    document.addEventListener("pointercancel",endLive2dDrag);
    live2dWidget.addEventListener("lostpointercapture",endLive2dDrag);
    live2dWidget.addEventListener("click",e=>{
      e.stopPropagation();
      if(isLive2dSettingsTarget(e.target))return;
      showLive2dSettingsButton();
      if(suppressLive2dClick){suppressLive2dClick=false;live2dDragged=false;return}
      if(!hitLive2dPixel(e)){
        showClickText(e.clientX,e.clientY);
        return;
      }
      showLive2dDialog();
      if(model?.motion)model.motion("TapBody").catch(()=>{});
    });
    await switchLive2dModel(getLive2dModelKey(localStorage.getItem("live2dModel")));
  }catch(err){
    live2dWidget.classList.add("live2d-hidden");
    console.warn("Live2D model load failed:",err);
  }
};
if(document.readyState==="complete")initLive2d();else window.addEventListener("load",initLive2d);

document.addEventListener("visibilitychange",()=>{if(document.hidden){siteWasHidden=true;return}if(siteWasHidden){siteWasHidden=false;setTimeout(()=>showLive2dDialog(live2dReturnMessage),260)}});
let lastHashClickAt=0;
const flashSection=(sec,delay=0)=>{if(!sec)return;window.setTimeout(()=>{sec.classList.remove("flash-highlight");sec.querySelectorAll(".section-glow-ring").forEach(ring=>ring.remove());void sec.offsetWidth;const ring=document.createElement("span");ring.className="section-glow-ring";ring.setAttribute("aria-hidden","true");sec.appendChild(ring);sec.classList.add("flash-highlight");window.clearTimeout(sec._flashHighlightTimer);sec._flashHighlightTimer=window.setTimeout(()=>{sec.classList.remove("flash-highlight");ring.remove()},2700)},delay)};
const getHashSection=()=>{const id=window.location.hash?decodeURIComponent(window.location.hash.slice(1)):"";return id?document.getElementById(id):null};
hashActionLinks.forEach(a=>a.addEventListener("click",()=>{const id=a.getAttribute("href"),sec=id&&id.startsWith("#")?document.getElementById(id.slice(1)):null;if(!sec)return;lastHashClickAt=Date.now();flashSection(sec,360)}));
window.addEventListener("hashchange",()=>{if(Date.now()-lastHashClickAt<800)return;flashSection(getHashSection(),360)});
if(document.readyState==="complete")flashSection(getHashSection(),520);else window.addEventListener("load",()=>flashSection(getHashSection(),520));
document.addEventListener("click",e=>{if(e.target.closest("a,button,input,select,label,summary,details,.quick-jump,.live2d-widget"))return;showClickText(e.clientX,e.clientY)});
document.addEventListener("pointerdown",()=>{if(isViewerEnabled()&&musicEnabled&&player.paused&&player.src)player.play().catch(()=>{})},{passive:true});
