document.documentElement.classList.add("js");
/*
 * 构建标记：用来确认浏览器实际加载的是哪一份 script.js。
 * 排查「改了没生效」时，在控制台执行 document.documentElement.dataset.build 即可。
 */
document.documentElement.dataset.build = "20261007-10";
console.info("[Sakura_Love] build 20261007-10 · 紧凑排版 + Motion 交互");
const launcherMode=new URLSearchParams(window.location.search).has("launcher");
if(launcherMode)document.documentElement.classList.add("launcher-desktop-view");
if(launcherMode&&"scrollRestoration"in history)history.scrollRestoration="manual";
const forceLauncherInitialView=()=>{if(launcherMode)window.scrollTo({top:0,left:0,behavior:"auto"})};
if(launcherMode)window.addEventListener("load",()=>requestAnimationFrame(()=>requestAnimationFrame(forceLauncherInitialView)),{once:true});
const $=(s)=>document.querySelector(s);
const yearSpan=$("#year"),styleSelect=$("#style-select"),languageToggle=$("#language-toggle"),sidebarToggle=$("#sidebar-toggle"),sidebarAvatarButton=$("#sidebar-avatar-button"),sidebarAvatarInput=$("#sidebar-avatar-input"),sidebarLogoMark=$(".sidebar-logo-mark"),sidebarLinks=document.querySelectorAll(".sidebar-link"),designStyleButtons=document.querySelectorAll(".design-style-btn"),layoutModeButtons=document.querySelectorAll(".view-mode-btn"),bgToggle=$("#bg-toggle"),bgCharacterSelect=$("#bg-character-select"),bgPlayModeSelect=$("#bg-play-mode"),musicToggle=$("#music-toggle"),musicVolumeInput=$("#music-volume"),musicSeekInput=$("#music-seek"),musicTimeDisplay=$("#music-time-display"),headerMusicPrevButton=$("#header-music-prev"),headerMusicNextButton=$("#header-music-next"),headerImagePrevButton=$("#header-image-prev"),headerImageNextButton=$("#header-image-next"),pageMuteToggleButton=$("#page-mute-toggle"),muteProgressArc=$("#mute-progress-arc"),animeViewer=$(".anime-viewer"),bgLayerA=$("#bg-layer-a"),bgLayerB=$("#bg-layer-b"),live2dCanvas=$("#live2d-canvas"),live2dWidget=$("#live2d-widget"),live2dDialog=$("#live2d-dialog"),live2dModelSelect=$("#live2d-model"),live2dSizeInput=$("#live2d-size"),live2dSizeValue=$("#live2d-size-value"),live2dSettingsToggle=$("#live2d-settings-toggle"),live2dSettingsPanel=$("#live2d-settings-panel"),live2dToggleButton=$("#live2d-toggle"),hashActionLinks=document.querySelectorAll(".hero-actions a[href^='#'],.sidebar-link[href^='#']"),toastRoot=$("#toast-root");
const musicLibraryAudio=$("#music-library-audio"),musicLibraryArtist=$("#music-library-artist"),musicLibraryTitle=$("#music-library-title"),musicLibraryStatus=$("#music-api-status"),musicLocalList=$("#music-local-list"),musicLocalCount=$("#music-local-count"),musicLibraryPlay=$("#music-library-play"),musicLibraryProgress=$("#music-library-progress"),musicLibraryVolume=$("#music-library-volume"),musicLibraryMute=$("#music-library-mute"),musicLibraryTime=$("#music-library-time"),musicLibrarySource=$("#music-library-source");
const styleMap={apple:"design-apple",shadcn:"design-shadcn",tailwind:"design-tailwind"};
const rootThemeTokens={
  apple:{canvas:"#1d1d1f",text:"#f5f5f7",scheme:"dark"},
  shadcn:{canvas:"#fafafa",text:"#18181b",scheme:"light"},
  tailwind:{canvas:"#fffbf7",text:"#292524",scheme:"light"}
};
const legacyStyleClasses=["style-warm","style-tech","style-minimal","style-melancholy"];
let activeDesignStyleKey=localStorage.getItem("stylePreset")||"apple";
let activeDesignStyleClass=styleMap[activeDesignStyleKey]||styleMap.apple;
const live2dModels={
  tutu:{name:"草莓兔兔",path:"assets/live2d/tutu/草莓兔兔  试用.model3.json",scale:0.92,watermarkParam:"Param261"},
  designGenius:{name:"设计天才·白",path:"live2d-widget-v3-main/Resources/model/DesignGenius/Design_genius(1).model3.json",scale:0.92},
  mao:{name:"Mao",path:"live2d-widget-v3-main/Resources/model/Mao/Mao.model3.json",scale:0.92},
  hiyori:{name:"Hiyori",path:"live2d-widget-v3-main/Resources/model/Hiyori/Hiyori.model3.json",scale:0.92},
  haru:{name:"Haru",path:"live2d-widget-v3-main/Resources/model/Haru/Haru.model3.json",scale:0.92}
};
const live2dCdnBase="https://cdn.jsdelivr.net/gh/SakuraLoveForever/website_Sakura_Love@main/";
const live2dFileMode=window.location.protocol==="file:";
const live2dDefaultModel=live2dFileMode?"hiyori":"tutu";
const getLive2dModelKey=(key)=>live2dModels[key]?key:live2dDefaultModel;
const live2dCdnUrl=(path)=>live2dCdnBase+path.split("/").map(encodeURIComponent).join("/");
const live2dModelSources=(config)=>[config.path,live2dCdnUrl(config.path)];
const loadLive2dModel=async(config)=>{
  let lastError=null;
  for(const source of live2dModelSources(config)){
    try{return await PIXI.live2d.Live2DModel.from(source,{autoUpdate:false})}
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
let bgPlayMode=localStorage.getItem("bgPlayMode")||"single",activeBgLayer=bgLayerA,bgTimer=null,currentRole=localStorage.getItem("bgCharacter")||"02",isPagePaused=true,musicEnabled=localStorage.getItem("musicEnabled")!=="false",live2dEnabled=localStorage.getItem("live2dEnabled")!=="false",_suppressSelectChange=false;
const bgSeq={},musicSeq={},player=new Audio();
player.loop=false;player.preload="auto";player.volume=Math.min(1,Math.max(0,Number(localStorage.getItem("musicVolume"))||0.6));player.muted=false;localStorage.removeItem("pageMuted");
if(live2dWidget)live2dWidget.classList.toggle("live2d-hidden",!live2dEnabled);
const isViewerEnabled=()=>true;
const showToast=(message)=>{if(!toastRoot)return;toastRoot.replaceChildren();const toast=document.createElement("div");toast.className="toast";toast.textContent=message;toastRoot.appendChild(toast);setTimeout(()=>toast.remove(),500)};
const fit=(el)=>{if(!el)return;const n=Math.max(4,...Array.from(el.options||[]).map(o=>(o.textContent||"").trim().length));el.style.width=`calc(${n}ch + 3.2rem)`};
const applySidebarAvatar=(src)=>{if(!sidebarLogoMark)return;if(src){sidebarLogoMark.style.setProperty("background-image",`url("${src}")`,"important");sidebarLogoMark.classList.add("has-custom-avatar");sidebarLogoMark.textContent=""}else{sidebarLogoMark.style.removeProperty("background-image");sidebarLogoMark.classList.remove("has-custom-avatar");sidebarLogoMark.textContent="S"}};
const getViewportAnchor=()=>{
  const x=window.innerWidth*0.5;
  const ys=[window.innerHeight*0.42,window.innerHeight*0.28,window.innerHeight*0.62,Math.min(120,window.innerHeight-1)];
  for(const y of ys){
    const el=document.elementFromPoint(x,clamp(y,0,window.innerHeight-1));
    const anchor=el?.closest?.("#hero,.section,#page-bottom,.site-footer,.anime-viewer")||el;
    if(anchor&&anchor!==document.body&&anchor!==document.documentElement)return {anchor,top:anchor.getBoundingClientRect().top,scrollY:window.scrollY};
  }
  return {anchor:null,top:0,scrollY:window.scrollY};
};
const restoreViewportAnchor=(marker)=>{
  if(!marker)return;
  if(marker.anchor?.isConnected){
    const delta=marker.anchor.getBoundingClientRect().top-marker.top;
    if(Math.abs(delta)>0.5)window.scrollBy({top:delta,left:0,behavior:"auto"});
    return;
  }
  window.scrollTo({top:marker.scrollY,left:0,behavior:"auto"});
};
const withViewportPreserved=(action,{frames=2,anchor=null}={})=>{
  const marker=anchor?.isConnected?{anchor,top:anchor.getBoundingClientRect().top,scrollY:window.scrollY}:getViewportAnchor();
  action();
  let pending=frames;
  const tick=()=>{
    restoreViewportAnchor(marker);
    if(pending>0){pending-=1;requestAnimationFrame(tick)}
  };
  requestAnimationFrame(tick);
};
const detectLayoutMode=()=>launcherMode?"desktop":/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent)||window.matchMedia?.("(pointer: coarse)")?.matches&&window.innerWidth<=920||window.innerWidth<=700?"mobile":"desktop";
let stylePersistTimer=0;
const persistStylePreset=(safe)=>{
  clearTimeout(stylePersistTimer);
  stylePersistTimer=setTimeout(()=>{
    localStorage.setItem("stylePreset",safe);
    localStorage.removeItem("themeMode");
  },0);
};
/* syncRootThemeTokens — 只设置 html 根元素属性。--canvas/--text 由 body.design-* CSS 类提供 */
const syncRootThemeTokens=(styleKey)=>{
  const safe=styleMap[styleKey]?styleKey:"apple";
  const root=document.documentElement;
  const tokens=rootThemeTokens[safe]||rootThemeTokens.apple;
  root.dataset.initialStyle=safe;
  root.style.backgroundColor=tokens.canvas;
  root.style.color=tokens.text;
  root.style.colorScheme=tokens.scheme||"dark";
};
const applyStyle=(k)=>{
  const safe=styleMap[k]?k:"apple";
  const nextClass=styleMap[safe];
  if(activeDesignStyleKey===safe
    &&activeDesignStyleClass===nextClass
    &&document.body.classList.contains(nextClass)
    &&document.body.classList.contains("theme-dark")===(safe==="apple")){
    if(styleSelect&&styleSelect.value!==safe)styleSelect.value=safe;
    designStyleButtons.forEach(button=>{const active=button.dataset.designStyle===safe;button.classList.toggle("active",active);button.setAttribute("aria-pressed",String(active))});
    return
  }
  if(activeDesignStyleClass&&activeDesignStyleClass!==nextClass)document.body.classList.replace(activeDesignStyleClass,nextClass);
  else if(!document.body.classList.contains(nextClass))document.body.classList.add(nextClass);
  legacyStyleClasses.forEach(cls=>{if(cls!==nextClass)document.body.classList.remove(cls)});
  activeDesignStyleKey=safe;
  activeDesignStyleClass=nextClass;
  document.body.classList.toggle("theme-dark",safe==="apple");
  syncRootThemeTokens(safe);
  designStyleButtons.forEach(button=>{const active=button.dataset.designStyle===safe;button.classList.toggle("active",active);button.setAttribute("aria-pressed",String(active))});
  if(styleSelect&&styleSelect.value!==safe)styleSelect.value=safe;
  persistStylePreset(safe);
};
const styleTransitionMs=320;
let styleTransitionTimer=0;
const beginStyleTransition=()=>{clearTimeout(styleTransitionTimer);document.body.classList.add("style-transitioning","theme-swap-active")};
const endStyleTransition=()=>{clearTimeout(styleTransitionTimer);styleTransitionTimer=setTimeout(()=>document.body.classList.remove("style-transitioning","theme-swap-active"),styleTransitionMs+120)};
const prefersReducedMotion=()=>Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
let live2dApp=null,live2dActiveModel=null,finishLive2dTransition=null;
const isLive2dVisible=()=>live2dEnabled&&!document.body.classList.contains("layout-mobile")&&window.innerWidth>833&&!document.hidden;
const syncLive2dRuntime=()=>{
  if(!live2dApp)return;
  const running=isLive2dVisible()&&!prefersReducedMotion();
  if(live2dActiveModel)live2dActiveModel.autoUpdate=running;
  if(running)live2dApp.start();
  else{
    finishLive2dTransition?.();
    live2dApp.stop();
    if(isLive2dVisible()&&live2dActiveModel){live2dActiveModel.internalModel.update(0,live2dActiveModel.elapsedTime);live2dApp.renderer.render(live2dApp.stage)}
  }
};
const applyStyleSmooth=(style,afterApply=()=>{})=>{
  const safe=styleMap[style]?style:"apple";
  if(prefersReducedMotion()){
    applyStyle(safe);
    afterApply();
    return
  }
  if(document.startViewTransition){
    const transition=document.startViewTransition(()=>{applyStyle(safe);afterApply()});
    transition.finished.then(()=>{}).catch(()=>{})
  }else{
    beginStyleTransition();
    const finish=()=>{endStyleTransition()};
    requestAnimationFrame(()=>{
      applyStyle(safe);
      afterApply();
      finish()
    })
  }
};
const applyLayoutMode=(mode)=>{const safe=mode==="mobile"?"mobile":"desktop";document.body.classList.toggle("layout-mobile",safe==="mobile");layoutModeButtons.forEach(button=>{const active=button.dataset.layoutMode===safe;button.classList.toggle("active",active);button.setAttribute("aria-pressed",String(active))});localStorage.setItem("layoutMode",safe);syncLive2dRuntime();window.dispatchEvent(new Event("site-layout-change"))};
const setBg=(role)=>{if(!bgLayerA||!bgLayerB)return;if(Date.now()-(setBg._ts||0)<250)return;setBg._ts=Date.now();const r=bgFiles[role]?.length?role:"02",files=bgFiles[r],idx=(bgSeq[r]||0)%files.length;bgSeq[r]=(bgSeq[r]||0)+1;currentRole=r;_suppressSelectChange=true;if(bgCharacterSelect)bgCharacterSelect.value=r;localStorage.setItem("bgCharacter",r);const prev=activeBgLayer,next=activeBgLayer===bgLayerA?bgLayerB:bgLayerA;next.classList.remove("visible");const show=()=>{next.classList.add("visible");if(prev)prev.classList.remove("visible");activeBgLayer=next;_applyStageClip(next);requestAnimationFrame(()=>syncMusicLibraryHeight())};next.src=`assets/backgrounds/${r}/${files[idx]}`;next.onload=show;next.onerror=show;if(next.complete)show()};
const _applyStageClip=(img)=>{if(!img||!img.naturalWidth||!img.naturalHeight)return;const s=img.closest(".music-library-stage");if(!s)return;const sw=s.clientWidth,sh=s.clientHeight;if(!sw||!sh)return;const ir=img.naturalWidth/img.naturalHeight,sr=sw/sh;let dw,dh;ir>sr?(dw=sw,dh=sw/ir):(dh=sh,dw=sh*ir);const ox=(sw-dw)/2,oy=(sh-dh)/2;img.style.clipPath=`inset(${Math.round(oy)}px ${Math.round(ox)}px ${Math.round(oy)}px ${Math.round(ox)}px round 14px)`};bgLayerA?.addEventListener("load",function(){_applyStageClip(this)});bgLayerB?.addEventListener("load",function(){_applyStageClip(this)});window.addEventListener("resize",()=>{[bgLayerA,bgLayerB].forEach(_applyStageClip)},{passive:true});
const nextRole=()=>{const start=bgRoleOrder.indexOf(currentRole);return bgRoleOrder[(start+1+bgRoleOrder.length)%bgRoleOrder.length]||"02"};
const nextSceneRole=(role=currentRole)=>bgPlayMode==="all"?nextRole():(bgCount[role]?role:"02");
let _durationCheckTimer=0;const ensureDuration=()=>{clearTimeout(_durationCheckTimer);if(!Number.isFinite(player.duration)||player.duration<=0){_durationCheckTimer=setTimeout(()=>{if(!Number.isFinite(player.duration)||player.duration<=0){const saved=player.currentTime;const onSeeked=()=>{player.removeEventListener("seeked",onSeeked);if(Number.isFinite(player.duration)&&player.duration>0){player.currentTime=Math.min(saved,player.duration||0);progress()}};player.addEventListener("seeked",onSeeked);player.currentTime=1e8}},1200)}};const playRole=(role)=>{if(!musicEnabled)return;const r=musicCount[role]?role:"02",count=musicCount[r],idx=((musicSeq[r]||0)%count)+1;musicSeq[r]=(musicSeq[r]||0)+1;player.src=`assets/music/${r}/${idx}.mp3`;if(musicSeekInput){musicSeekInput.value="0";musicSeekInput.max="100";musicSeekInput.style.setProperty("--seek","0%")}if(muteProgressArc)muteProgressArc.style.strokeDashoffset="100";progress();if(!isPagePaused)player.play().then(startMusicProgressLoop).catch(()=>{});ensureDuration()};
const showScene=(role,{withMusic=false}={})=>{const r=bgCount[role]?role:"02";setBg(r);if(withMusic)playRole(r)};
const scheduleBgOnly=()=>{clearInterval(bgTimer);if(!musicEnabled)bgTimer=setInterval(()=>showScene(nextSceneRole()),3000)};
const applyBg=(on,role)=>{clearInterval(bgTimer);if(animeViewer)animeViewer.classList.toggle("is-viewer-off",!on);if(!bgLayerA||!bgLayerB)return;if(!on){player.pause();bgLayerA.classList.remove("visible");bgLayerB.classList.remove("visible");bgLayerA.removeAttribute("src");bgLayerB.removeAttribute("src");return}showScene(role,{withMusic:musicEnabled});scheduleBgOnly()};
const playNext=()=>{if(!isViewerEnabled())return;const role=nextSceneRole(currentRole);showScene(role,{withMusic:musicEnabled})};const prevImageOnly=()=>{if(!isViewerEnabled())return;const r=bgCount[currentRole]?currentRole:"02";const files=bgFiles[r];bgSeq[r]=((bgSeq[r]||1)-2+files.length)%files.length;setBg(r)};const nextImageOnly=()=>{if(!isViewerEnabled())return;setBg(bgCount[currentRole]?currentRole:"02")};
const updateMusicButtonState=()=>{if(!pageMuteToggleButton)return;const active=Boolean(player.src)&&!player.paused&&!isPagePaused;const label=isPagePaused?ui("resumeCharMusic"):ui("pauseCharMusic");pageMuteToggleButton.classList.toggle("is-playing",active);pageMuteToggleButton.classList.toggle("muted",isPagePaused);pageMuteToggleButton.setAttribute("aria-pressed",String(isPagePaused));pageMuteToggleButton.setAttribute("aria-label",label);pageMuteToggleButton.title=label};
let musicProgressTimer=0;
let _musicSeekDragging=false;
const fmtTime=(s)=>{if(!Number.isFinite(s)||s<0)s=0;const m=Math.floor(s/60),sec=Math.floor(s%60);return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`};const drawMusicProgress=()=>{if(_musicSeekDragging)return;const d=player.duration,t=player.currentTime;if(musicTimeDisplay)musicTimeDisplay.textContent=`${fmtTime(t)} / ${Number.isFinite(d)&&d>0?fmtTime(d):"0:00"}`;if(muteProgressArc){if(Number.isFinite(d)&&d>0)muteProgressArc.style.strokeDashoffset=String(100-(t/d*100))}if(!musicSeekInput)return;if(Number.isFinite(d)&&d>0){musicSeekInput.max=String(d);musicSeekInput.value=String(t);musicSeekInput.style.setProperty("--seek",(t/d*100)+"%")}};
const progress=()=>{drawMusicProgress();updateMusicButtonState()};
const stopMusicProgressLoop=()=>{if(musicProgressTimer)clearInterval(musicProgressTimer);musicProgressTimer=0;progress()};
const startMusicProgressLoop=()=>{if(musicProgressTimer)return;progress();musicProgressTimer=setInterval(progress,120)};
const controls=()=>updateMusicButtonState();
const playModeUI=()=>{if(bgCharacterSelect)bgCharacterSelect.disabled=bgPlayMode!=="single"};
const syncLive2dToggleUI=()=>{
  if(!live2dToggleButton)return;
  const english=currentLanguage==="en";
  const state=live2dEnabled?(english?"Enabled":"已开启"):(english?"Disabled":"已关闭");
  const label=`${ui("live2dSwitch")}：${state}`;
  live2dToggleButton.classList.toggle("active",live2dEnabled);
  live2dToggleButton.setAttribute("aria-pressed",String(live2dEnabled));
  live2dToggleButton.setAttribute("aria-label",label);
  live2dToggleButton.title=label;
  live2dToggleButton.textContent=state;
};
const applyLive2dVisibility=()=>{if(!live2dWidget)return;live2dWidget.classList.toggle("live2d-hidden",!live2dEnabled);live2dWidget.setAttribute("aria-hidden",String(!live2dEnabled));if(!live2dEnabled){if(live2dSettingsPanel)live2dSettingsPanel.inert=true;live2dWidget.classList.remove("live2d-settings-open","live2d-settings-visible");if(live2dSettingsToggle)live2dSettingsToggle.setAttribute("aria-expanded","false")}};
const setLive2dEnabled=(enabled,{persist=true,initialize=true}={})=>{
  live2dEnabled=Boolean(enabled);
  if(persist)localStorage.setItem("live2dEnabled",String(live2dEnabled));
  if(!live2dEnabled)setLive2dLoading(false);
  applyLive2dVisibility();
  syncLive2dRuntime();
  syncLive2dToggleUI();
  applyLive2dSettings();
  if(live2dEnabled){
    if(initialize)refreshLive2dAfterShow();
    else settleLive2dChrome({frames:4});
  }
};
let currentLanguage=localStorage.getItem("languageMode")==="en"?"en":"zh";
const languageCopy={
  zh:{
    pageTitle:"Sakura_Love | 个人主页",pageDescription:"一个简洁、响应式的个人网页模板，展示个人介绍、项目与联系方式。",languageLabel:"切换语言",personalGallery:"个人画廊",intro:"把竞赛、工程、阅读与一点点二次元热爱，收束成一个安静的个人主页。",viewProjects:"查看项目",contactMe:"联系我",characterWindow:"角色窗口",characterViewer:"角色欣赏",muteToggle:"角色音乐静音开关",viewerStage:"角色图片展示窗口",viewerEmpty:"打开欣赏窗口后，这里会展示角色图片。",viewerSettings:"角色欣赏设置",character:"角色",chooseCharacter:"选择背景角色",playMode:"播放模式",playModeLabel:"背景播放模式",singleRole:"单角色",allRoles:"全角色",music:"音乐",enabled:"开启",volume:"音量",volumeLabel:"调节角色音乐音量",prevSongLabel:"上一首",nextSong:"切歌",nextSongLabel:"下一首",playBtn:"播放",pauseBtn:"暂停",prevImage:"上一张",nextImageLabel:"下一张",nextImageChanged:"换图",nextRole:"切角色",imageChanged:"图片已切换",muteMusic:"禁音",unmuteMusic:"取消禁音",musicProgress:"音乐播放进度",saveThumbPos:"保存缩略图位置",songCountTemplate:"{n}首",imageCountTemplate:"{n}张",noPlayableTemplate:"{title} 暂无可播放",musicCountTemplate:"{n} 首",aboutNav:"关于",projectsNav:"项目",contactNav:"联系",aboutTitle:"关于我",education:"学习经历",awards:"获奖经历",machinery:"机械类",mathematics:"数学类",programming:"计算机程序设计类",primary:"小学",junior:"初中",senior:"高中",bachelor:"本科",master:"硕士",primaryValue:"泉州市安溪县实验小学",juniorValue:"福州市金山中学",seniorValue:"福建省福州第一中学",bachelorValue:"福州大学（机械工程及自动化）",masterValue:"厦门大学（计算机科学与技术）",awardKey:"奖项",mechAward:"第一届普通高等学校本科生机械设计基础类课程实践作品竞赛（整机机构类、设计验证类）全国二等奖。",mathAward:"2024年全国大学生数学竞赛非数学A类福建省一等奖。",icpc2024:"第49届 ICPC 国际大学生程序设计竞赛区域赛上海站铜牌。",ccpc2025:"2025年中国大学生程序设计竞赛 CCPC 福建省邀请赛银奖。",gplt:"2024、2025 年团体程序设计天梯赛 GPLT 全国个人三等奖。",baiduStar:"2025年百度之星程序设计大赛省赛银奖。",lanqiao:"2025年蓝桥杯 C++ A 组福建省一等奖，全国个人三等奖。",projectsTitle:"项目",contactTitle:"联系我",contactHtml:'邮箱：<a href="mailto:jackjack1272@163.com">jackjack1272@163.com</a> | GitHub：<a href="https://github.com/SakuraLoveForever" target="_blank" rel="noreferrer">SakuraLoveForever</a>',projectLifeTitle:"卷里山河，心头月色",projectLifeAria:"查看卷里山河，心头月色",projectLifeDesc:"记录阅读与长夜随记，支持目录导航和夜间模式。",projectQuotesTitle:"心灵鸡汤 - 互动语录",projectQuotesAria:"查看心灵鸡汤 - 互动语录",projectQuotesDesc:"收藏语录与灵感，按分类浏览和快速跳转。",projectKindleTitle:"Kindle笔记导出工具",projectKindleAria:"查看 Kindle 笔记导出工具",projectKindleDesc:"本地解析 Kindle 阅读笔记，便捷导出并保护隐私。",projectYoutubeTitle:"YouTube取消点赞脚本",projectYoutubeAria:"查看 YouTube 取消点赞脚本",projectYoutubeDesc:"批量取消 YouTube 点赞，简化重复点击。",projectGithubTitle:"GitHub个人首页",projectGithubAria:"查看GitHub个人首页",projectGithubDesc:"技术栈、开发成果与个人介绍的 GitHub 入口。",projectPcGuardTitle:"电脑守护精灵",projectPcGuardAria:"查看电脑守护精灵",projectPcGuardDesc:"管理 Windows 启动项与定时电源计划。",projectAnimeTitle:"AI 追番助手",projectAnimeAria:"查看AI 追番助手",projectAnimeDesc:"多源番剧搜索与追剧管理，支持 DeepSeek 智能填充。",projectMacroflowTitle:"MacroFlowStudio",projectMacroflowDesc:"键鼠宏录制与工作流编排，支持图像定位和离线 OCR。",projectMacroflowAria:"查看 MacroFlowStudio",projectFilegoTitle:"FileGo",projectFilegoDesc:"文件传输与定时任务，让重复操作自动完成。",projectFilegoAria:"查看 FileGo",projectTabsyncTitle:"tab-sync",projectTabsyncDesc:"在 Chrome、Edge 和 Firefox 之间迁移标签页。",projectTabsyncAria:"查看 tab-sync",projectAppcounterTitle:"AppCounter",projectAppcounterDesc:"统计 Windows 应用使用时间，了解自己的数字习惯。",projectAppcounterAria:"查看 AppCounter",projectAutocleanTitle:"auto_clean",projectAutocleanDesc:"自动清理文件，减少手动整理的时间。",projectAutocleanAria:"查看 auto_clean",live2dOpen:"展开看板娘设置",live2dSettings:"看板娘设置",live2dToggle:"看板娘",live2dSwitch:"看板娘",live2dOn:"开启",live2dOff:"关闭",live2dModel:"看板娘角色",chooseLive2dModel:"选择看板娘角色",live2dSize:"看板娘大小",adjustLive2dSize:"调节看板娘大小",top:"顶部",topAria:"回到顶部",bottom:"底部",bottomAria:"跳到底部",style:"风格",styleAria:"切换网页风格",styleGroup:"选择 Apple、shadcn/ui 或 Tailwind Blog 风格",view:"视图",viewAria:"切换网页布局",viewGroup:"选择网页端或移动端布局",desktop:"网页端",mobile:"移动端",xhs:"小红书",xhsHome:"小红书主页",githubHome:"GitHub主页",bilibiliHome:"Bilibili主页",quoteCategory:"语录",quoteAllRandom:"全部随机",quoteOrder:"正序",quoteReverse:"倒序",switchQuoteCategory:"切换语录分类",chooseQuoteCategory:"选择语录分类",switchQuoteOrder:"切换语录顺序",toggleQuoteOrder:"切换正序/倒序",scrollSpeed:"滚动速度",adjustScrollSpeed:"调节滚动速度",adjustProjectScrollSpeed:"调节项目卡片滚动速度",musicLibraryTitle:"音乐收藏",pageSettingsTitle:"页面设置",thumbPosNoData:"⚠️ 没有可保存的缩略图",thumbPosSaved:"✓ 已保存 {n} 个缩略图位置",thumbPosPartial:"⚠️ 仅保存 {s}/{t} 个（{f} 个失败）",musicPausedToast:"音乐已暂停",musicResumedToast:"音乐继续播放",avatarSaveProject:"头像已保存到项目中",avatarSaveLocal:"头像已更新 — 请将下载的 avatar.png 放入 assets/ 文件夹",imageTooLarge:"图片太大了",avatarSetByOwner:"头像由站长设置",live2dToggleAria:"开关看板娘",live2dDefaultName:"看板娘",live2dReturnMessage:"哇，你终于回来了~",resumeCharMusic:"继续播放",pauseCharMusic:"暂停播放",languageUpdated:"语言已切换",darkOn:"夜间模式已开启",darkOff:"夜间模式已关闭",mobileLayout:"已切换移动端布局",desktopLayout:"已切换网页端布局",bgRoleChanged:"欣赏角色已切换",playModeUpdated:"播放模式已更新",musicOn:"音乐已开启",musicOff:"音乐已关闭",live2dModelChanged:"看板娘角色已切换",songChanged:"歌曲已切换",roleChanged:"角色已切换",muted:"已静音",unmuted:"已取消静音",mute:"静音",unmute:"取消静音"
  },
  en:{
    pageTitle:"Sakura_Love | Personal Site",pageDescription:"A clean, responsive personal website for profile, projects, and contact links.",languageLabel:"Switch language",personalGallery:"Personal Gallery",intro:"A quiet personal homepage for competitions, engineering, reading, and a little anime-inspired warmth.",viewProjects:"View Projects",contactMe:"Contact Me",characterWindow:"Character Window",characterViewer:"Character Viewer",muteToggle:"Toggle character music mute",viewerStage:"Character image display window",viewerEmpty:"Open the viewer and character images will appear here.",viewerSettings:"Character viewer settings",character:"Character",chooseCharacter:"Choose background character",playMode:"Playback Mode",playModeLabel:"Background playback mode",singleRole:"Single Character",allRoles:"All Characters",music:"Music",enabled:"Enabled",volume:"Volume",volumeLabel:"Adjust character music volume",prevSongLabel:"Previous song",nextSong:"Next song",nextSongLabel:"Next song",playBtn:"Play",pauseBtn:"Pause",prevImage:"Previous image",nextImageLabel:"Next image",nextImageChanged:"Next image",nextRole:"Next character",imageChanged:"Image changed",muteMusic:"Mute",unmuteMusic:"Unmute",musicProgress:"Playback progress",saveThumbPos:"Save thumbnail position",songCountTemplate:"{n} songs",imageCountTemplate:"{n} images",noPlayableTemplate:"{title} not playable",musicCountTemplate:"{n} tracks",aboutNav:"About",projectsNav:"Projects",contactNav:"Contact",aboutTitle:"About Me",education:"Education",awards:"Awards",machinery:"Mechanical Design",mathematics:"Mathematics",programming:"Programming",primary:"Primary School",junior:"Junior High",senior:"Senior High",bachelor:"Bachelor",master:"Master",primaryValue:"Anxi Experimental Primary School, Quanzhou",juniorValue:"Jinshan Middle School, Fuzhou",seniorValue:"Fuzhou No.1 High School, Fujian",bachelorValue:"Fuzhou University (Mechanical Engineering and Automation)",masterValue:"Xiamen University (Computer Science and Technology)",awardKey:"Award",mechAward:"National Second Prize in the first undergraduate mechanical design fundamentals practice competition.",mathAward:"First Prize, Fujian Province, 2024 National College Student Mathematics Competition, Non-Math A group.",icpc2024:"Bronze Medal, ICPC 2024 Shanghai Regional Contest.",ccpc2025:"Silver Medal, CCPC 2025 Fujian Invitational Contest.",gplt:"National Individual Third Prize, GPLT Team Programming Contest in 2024 and 2025.",baiduStar:"Provincial Silver Medal, Baidu Star Programming Contest 2025.",lanqiao:"First Prize in Fujian Province and National Individual Third Prize, Lanqiao Cup 2025 C++ A group.",projectsTitle:"Projects",contactTitle:"Contact",contactHtml:'Email: <a href="mailto:jackjack1272@163.com">jackjack1272@163.com</a> | GitHub: <a href="https://github.com/SakuraLoveForever" target="_blank" rel="noreferrer">SakuraLoveForever</a>',projectLifeTitle:"Mountains in Pages, Moonlight in Mind",projectLifeAria:"View Mountains in Pages, Moonlight in Mind",projectLifeDesc:"Reading notes with a table of contents and night mode.",projectQuotesTitle:"Soul Quotes Archive",projectQuotesAria:"View Soul Quotes Archive",projectQuotesDesc:"Browse collected quotes and inspiration by category.",projectKindleTitle:"Kindle Notes Exporter",projectKindleAria:"View Kindle Notes Exporter",projectKindleDesc:"Parse and export Kindle notes locally, keeping your data private.",projectYoutubeTitle:"YouTube Unlike Helper",projectYoutubeAria:"View YouTube Unlike Helper",projectYoutubeDesc:"Remove YouTube likes in batches with fewer repetitive clicks.",projectGithubTitle:"GitHub Profile",projectGithubAria:"View GitHub Profile",projectGithubDesc:"Explore my technology stack, projects, and GitHub profile.",projectPcGuardTitle:"PC Guardian",projectPcGuardAria:"View PC Guardian",projectPcGuardDesc:"Manage Windows startup entries and scheduled power plans.",projectAnimeTitle:"AI Anime Tracker",projectAnimeAria:"View AI Anime Tracker",projectAnimeDesc:"Find and track anime, with DeepSeek-assisted information filling.",projectMacroflowTitle:"MacroFlowStudio",projectMacroflowDesc:"A macro studio for workflows, image matching, and offline OCR.",projectMacroflowAria:"View MacroFlowStudio",projectFilegoTitle:"FileGo",projectFilegoDesc:"File transfers and scheduled tasks for everyday automation.",projectFilegoAria:"View FileGo",projectTabsyncTitle:"tab-sync",projectTabsyncDesc:"Move tabs between Chrome, Edge, and Firefox.",projectTabsyncAria:"View tab-sync",projectAppcounterTitle:"AppCounter",projectAppcounterDesc:"Track time spent in Windows apps and understand your digital habits.",projectAppcounterAria:"View AppCounter",projectAutocleanTitle:"auto_clean",projectAutocleanDesc:"Automate file cleanup and spend less time organizing.",projectAutocleanAria:"View auto_clean",live2dOpen:"Open Live2D settings",live2dSettings:"Live2D settings",live2dToggle:"Live2D",live2dSwitch:"Live2D mascot",live2dModel:"Live2D Model",chooseLive2dModel:"Choose Live2D model",live2dSize:"Live2D Size",adjustLive2dSize:"Adjust Live2D size",top:"Top",topAria:"Back to top",bottom:"Bottom",bottomAria:"Jump to bottom",style:"Style",styleAria:"Switch website style",styleGroup:"Choose Apple, shadcn/ui, or Tailwind Blog style",view:"View",viewAria:"Switch website layout",viewGroup:"Choose desktop or mobile layout",desktop:"Desktop",mobile:"Mobile",xhs:"Xiaohongshu",xhsHome:"Xiaohongshu profile",githubHome:"GitHub profile",bilibiliHome:"Bilibili profile",quoteCategory:"Quotes",quoteAllRandom:"All Random",quoteOrder:"Forward",quoteReverse:"Reverse",switchQuoteCategory:"Switch quote category",chooseQuoteCategory:"Choose quote category",switchQuoteOrder:"Switch quote order",toggleQuoteOrder:"Toggle order",scrollSpeed:"Scroll Speed",adjustScrollSpeed:"Adjust scroll speed",adjustProjectScrollSpeed:"Adjust project card scroll speed",musicLibraryTitle:"Music Collection",pageSettingsTitle:"Page Settings",thumbPosNoData:"No thumbnails to save",thumbPosSaved:"Saved {n} thumbnail positions",thumbPosPartial:"Only saved {s}/{t} ({f} failed)",musicPausedToast:"Music paused",musicResumedToast:"Music resumed",avatarSaveProject:"Avatar saved to project",avatarSaveLocal:"Avatar updated — place avatar.png into assets/ folder",imageTooLarge:"Image is too large",avatarSetByOwner:"Avatar set by site owner",live2dToggleAria:"Toggle Live2D mascot",live2dDefaultName:"Live2D mascot",live2dReturnMessage:"Hey, you're back~",resumeCharMusic:"Resume music",pauseCharMusic:"Pause music",languageUpdated:"Language switched",darkOn:"Dark mode enabled",darkOff:"Dark mode disabled",mobileLayout:"Switched to mobile layout",desktopLayout:"Switched to desktop layout",bgRoleChanged:"Character changed",playModeUpdated:"Playback mode updated",musicOn:"Music enabled",musicOff:"Music disabled",live2dModelChanged:"Live2D model changed",songChanged:"Song changed",roleChanged:"Character changed",muted:"Muted",unmuted:"Unmuted",mute:"Mute",unmute:"Unmute"
  }
};
const ui=(key)=>languageCopy[currentLanguage]?.[key]||languageCopy.zh[key]||key;
const setText=(selector,text)=>{const el=$(selector);if(el)el.textContent=text};
const setHtml=(selector,html)=>{const el=$(selector);if(el)el.innerHTML=html};
const setAttr=(selector,attr,value)=>{const el=$(selector);if(el)el.setAttribute(attr,value)};
function syncProjectPortfolio(language=currentLanguage){
  const en=language==="en";
  const labels=en?{all:"All work",tools:"Productivity",web:"Web projects",browser:"Browser tools",anime:"Anime & AI"}:{all:"全部作品",tools:"效率工具",web:"Web 作品",browser:"浏览器工具",anime:"动漫与 AI"};
  const buttons=document.querySelectorAll("[data-project-filter]");
  const active=document.querySelector('[data-project-filter][aria-pressed="true"]')?.dataset.projectFilter||"all";
  buttons.forEach(button=>button.textContent=labels[button.dataset.projectFilter]);
  const cards=[...document.querySelectorAll("#projects .card")];
  cards.forEach(card=>{card.hidden=active!=="all"&&card.dataset.projectCategory!==active});
  const count=cards.filter(card=>!card.hidden).length;
  setText("#project-result-count",en?`${count} projects`:`${count} 个作品`);
  setText(".projects-intro",en?"Ideas turned into useful tools. Passion turned into projects.":"把想法做成工具，也把热爱写进作品。");
  setAttr(".project-filters","aria-label",en?"Filter projects":"筛选项目");
  setText('[data-project-copy="featured"]',en?"Featured project":"精选项目");
  const tags=en?["Automation","Reading","Quotes","Reading tool","Windows","File transfer","Browser tools","Usage statistics","Browser tools","Automation","Anime & AI","Personal profile"]:["自动化工具","阅读随笔","语录收藏","阅读工具","Windows 工具","文件传输","浏览器工具","使用统计","浏览器工具","自动化工具","动漫与 AI","个人主页"];
  cards.forEach((card,index)=>{const tag=card.querySelector(".card-tag");if(tag)tag.textContent=tags[index]});
}
document.querySelectorAll("[data-project-filter]").forEach(button=>button.addEventListener("click",()=>{
  document.querySelectorAll("[data-project-filter]").forEach(other=>other.setAttribute("aria-pressed",String(other===button)));
  syncProjectPortfolio();
  if(!prefersReducedMotion()&&window.Motion){
    const cards=document.querySelectorAll('#projects .card:not([hidden]) .card-body');
    Motion.animate(cards,{opacity:[.35,1],transform:['translateY(6px)','translateY(0)']},{duration:.2,ease:[.22,1,.36,1]});
  }
  updateSidebarActive();
}));
let live2dReturnMessage="";
const applyLanguage=(mode)=>{
  const safe=mode==="en"?"en":"zh",copy=languageCopy[mode==="en"?"en":"zh"];
  currentLanguage=safe;document.documentElement.lang=safe==="en"?"en":"zh-CN";document.title=copy.pageTitle;
  const meta=document.querySelector('meta[name="description"]');if(meta)meta.setAttribute("content",copy.pageDescription);
  if(languageToggle){languageToggle.setAttribute("aria-label",copy.languageLabel);languageToggle.setAttribute("title",copy.languageLabel);const text=languageToggle.querySelector(".language-text");if(text)text.textContent=safe==="en"?"中":"EN"}
  setText(".hero-copy .eyebrow",copy.personalGallery);setText(".hero-copy .intro",copy.intro);setText(".hero-actions .btn.primary",copy.viewProjects);setText(".hero-actions .btn.secondary",copy.contactMe);
  setText(".anime-viewer-head .eyebrow",copy.characterWindow);setText("#anime-viewer-title",copy.characterViewer);setAttr("#page-mute-toggle","aria-label",copy.muteToggle);setAttr(".anime-viewer-stage","aria-label",copy.viewerStage);setText(".anime-viewer-empty",copy.viewerEmpty);setAttr(".anime-viewer-settings","aria-label",copy.viewerSettings);
  setText("#bg-character-wrap .control-title",copy.character);setAttr("#bg-character-select","aria-label",copy.chooseCharacter);setText(".anime-viewer-settings .control-group:nth-of-type(2) .control-title",copy.playMode);setAttr("#bg-play-mode","aria-label",copy.playModeLabel);setText('#bg-play-mode option[value="single"]',copy.singleRole);setText('#bg-play-mode option[value="all"]',copy.allRoles);setText(".anime-viewer-settings .control-group:nth-of-type(3) .control-title",copy.music);setText(".check-row span",copy.enabled);setAttr("#music-toggle","aria-label",copy.music);setAttr("#music-volume","aria-label",copy.volumeLabel);setAttr("#music-volume","title",copy.volume);setAttr("#header-music-prev","aria-label",copy.prevSongLabel);setAttr("#header-music-prev","title",copy.prevSongLabel);setAttr("#music-library-play","aria-label",copy.playBtn);setAttr("#header-music-next","aria-label",copy.nextSongLabel);setAttr("#header-music-next","title",copy.nextSongLabel);setAttr("#header-image-prev","aria-label",copy.prevImage);setAttr("#header-image-prev","title",copy.prevImage);setAttr("#header-image-next","aria-label",copy.nextImageLabel);setAttr("#header-image-next","title",copy.nextImageLabel);setAttr("#music-library-mute","aria-label",copy.muteMusic);setAttr("#music-library-mute","title",copy.muteMusic);setAttr("#music-library-progress","aria-label",copy.musicProgress);setAttr("#music-library-volume","aria-label",copy.volume);setAttr("#music-library-volume","title",copy.volume);setAttr("#music-save-thumb-pos","aria-label",copy.saveThumbPos);setAttr("#music-save-thumb-pos","title",copy.saveThumbPos);
  const sidebarText=safe==="en"?{home:"Home",about:"About Me",projects:"Projects",music:"Music",contact:"Contact",settings:"Page Settings",mode:"Theme",collapse:"Collapse sidebar",expand:"Expand sidebar",avatar:"Upload custom avatar"}:{home:"首页",about:"关于我",projects:"项目",music:"音乐",contact:"联系",settings:"页面设置",mode:"模式切换",collapse:"收缩侧边栏",expand:"展开侧边栏",avatar:"上传自定义头像"};
  Object.entries(sidebarText).forEach(([key,text])=>{if(!["mode","collapse","expand","avatar"].includes(key))setText(`.sidebar-link[data-nav-key="${key}"] .sidebar-label`,text)});
  if(sidebarToggle)sidebarToggle.setAttribute("aria-label",document.body.classList.contains("sidebar-collapsed")?sidebarText.expand:sidebarText.collapse);if(sidebarAvatarButton){sidebarAvatarButton.setAttribute("aria-label",sidebarText.avatar);sidebarAvatarButton.setAttribute("title",sidebarText.avatar)}
  setText("#about > h2",copy.aboutTitle);setText("#about > details:nth-of-type(1) > summary",copy.education);setText("#about > details:nth-of-type(2) > summary",copy.awards);setText(".about-sub-panel:nth-of-type(1) > summary",copy.machinery);setText(".about-sub-panel:nth-of-type(2) > summary",copy.mathematics);setText(".about-sub-panel:nth-of-type(3) > summary",copy.programming);
  const aboutKeys=document.querySelectorAll("#about > details:nth-of-type(1) .about-key");[copy.primary,copy.junior,copy.senior,copy.bachelor,copy.master].forEach((text,index)=>{if(aboutKeys[index])aboutKeys[index].textContent=text});
  const aboutValues=document.querySelectorAll("#about > details:nth-of-type(1) .about-value");[copy.primaryValue,copy.juniorValue,copy.seniorValue,copy.bachelorValue,copy.masterValue].forEach((text,index)=>{if(aboutValues[index])aboutValues[index].textContent=text});
  document.querySelectorAll(".awards-panel .about-key").forEach((el,index)=>{if(index<2)el.textContent=copy.awardKey});
  const awardValues=document.querySelectorAll(".awards-panel .about-value");[copy.mechAward,copy.mathAward,copy.icpc2024,copy.ccpc2025,copy.gplt,copy.baiduStar,copy.lanqiao].forEach((text,index)=>{if(awardValues[index])awardValues[index].textContent=text});
  setText("#projects > h2",copy.projectsTitle);
  syncProjectPortfolio(safe);
  // ⚠️ 顺序契约：下面三个数组按 **DOM 索引** 依次写回 index.html `#projects .card` 里的
  // 标题 / aria-label / 描述。改动项目卡的顺序或增删卡片时，必须同步改这里，
  // 否则文案会整体错位（而且是静默的，不报错）。当前 12 张卡与数组一一对应。
  const projectTitles=document.querySelectorAll(".project-title-btn"),projectTitleCopy=[copy.projectMacroflowTitle,copy.projectLifeTitle,copy.projectQuotesTitle,copy.projectKindleTitle,copy.projectPcGuardTitle,copy.projectFilegoTitle,copy.projectTabsyncTitle,copy.projectAppcounterTitle,copy.projectYoutubeTitle,copy.projectAutocleanTitle,copy.projectAnimeTitle,copy.projectGithubTitle],projectAriaCopy=[copy.projectMacroflowAria,copy.projectLifeAria,copy.projectQuotesAria,copy.projectKindleAria,copy.projectPcGuardAria,copy.projectFilegoAria,copy.projectTabsyncAria,copy.projectAppcounterAria,copy.projectYoutubeAria,copy.projectAutocleanAria,copy.projectAnimeAria,copy.projectGithubAria];projectTitles.forEach((el,index)=>{if(projectTitleCopy[index]){el.textContent=projectTitleCopy[index];el.setAttribute("aria-label",projectAriaCopy[index])}});
  const projectDescriptions=document.querySelectorAll(".project-grid .card p");[copy.projectMacroflowDesc,copy.projectLifeDesc,copy.projectQuotesDesc,copy.projectKindleDesc,copy.projectPcGuardDesc,copy.projectFilegoDesc,copy.projectTabsyncDesc,copy.projectAppcounterDesc,copy.projectYoutubeDesc,copy.projectAutocleanDesc,copy.projectAnimeDesc,copy.projectGithubDesc].forEach((text,index)=>{if(projectDescriptions[index])projectDescriptions[index].textContent=text});
  setText("#contact > h2",copy.contactTitle);setHtml("#contact > p",copy.contactHtml);
  setAttr("#live2d-settings-toggle","aria-label",copy.live2dOpen);setAttr("#live2d-settings-panel","aria-label",copy.live2dSettings);setText(".live2d-settings-panel .control-group:nth-of-type(1) .control-title",copy.live2dModel);setAttr("#live2d-model","aria-label",copy.chooseLive2dModel);const live2dSizeTitle=$(".live2d-settings-panel .control-group:nth-of-type(2) .control-title");if(live2dSizeTitle&&live2dSizeValue)live2dSizeTitle.firstChild.nodeValue=`${copy.live2dSize} `;setAttr("#live2d-size","aria-label",copy.adjustLive2dSize);setAttr("#live2d-resize-handle","aria-label",copy.adjustLive2dSize);setAttr("#live2d-resize-handle","title",copy.adjustLive2dSize);setText(".live2d-toggle-switch > span",copy.live2dSwitch||copy.live2dToggle||"Live2D");setAttr(".live2d-toggle-switch","aria-label",copy.live2dToggleAria);syncLive2dToggleUI();
  setText("#live2d-panel-title",copy.live2dSettings);
  setText("#live2d-next-model",safe==="en"?"Next character →":"切换看板娘 →");
  setAttr("#live2d-settings-close","aria-label",safe==="en"?"Close character settings":"关闭看板娘设置");
  setAttr("#live2d-size-reset","aria-label",safe==="en"?"Reset character size":"重置看板娘大小");
  setAttr('[data-live2d-size-step="-10"]',"aria-label",safe==="en"?"Smaller character":"缩小看板娘");
  setAttr('[data-live2d-size-step="10"]',"aria-label",safe==="en"?"Larger character":"放大看板娘");
  setText('.jump-btn[href="#page-top"]',copy.top);setAttr('.jump-btn[href="#page-top"]',"aria-label",copy.topAria);setText('.jump-btn[href="#page-bottom"]',copy.bottom);setAttr('.jump-btn[href="#page-bottom"]',"aria-label",copy.bottomAria);
  setText(".design-style-switch > span",copy.style);setAttr(".design-style-switch","aria-label",copy.styleAria);setAttr(".design-style-options","aria-label",copy.styleGroup);setText(".view-mode-switch > span",copy.view);setAttr(".view-mode-switch","aria-label",copy.viewAria);setAttr(".view-mode-options","aria-label",copy.viewGroup);setText('.view-mode-btn[data-layout-mode="desktop"]',copy.desktop);setText('.view-mode-btn[data-layout-mode="mobile"]',copy.mobile);
  setText(".particle-width-switch label",safe==="en"?"Particle width":"粒子粗细");setAttr("#particle-line-width","aria-label",safe==="en"?"Adjust particle thickness":"调节粒子粗细");
  setAttr(".social-xhs","aria-label",copy.xhs);setAttr(".social-xhs","title",copy.xhs);setAttr(".social-links-bottom .social-xhs","aria-label",copy.xhsHome);setAttr(".social-github","aria-label","GitHub");setAttr(".social-github","title","GitHub");setAttr(".social-links-bottom .social-github","aria-label",copy.githubHome);setAttr(".social-bilibili","aria-label","Bilibili");setAttr(".social-bilibili","title","Bilibili");setAttr(".social-links-bottom .social-bilibili","aria-label",copy.bilibiliHome);
  setText("#music-library h2",copy.musicLibraryTitle);setText(".footer-settings-title",copy.pageSettingsTitle);
  setText("#appearance-settings-label",safe==="en"?"Appearance":"外观");
  setText("#animation-settings-label",safe==="en"?"Animation & interaction":"动画与互动");
  setText(".quote-category-switch > span",copy.quoteCategory);setAttr(".quote-category-switch","aria-label",copy.switchQuoteCategory);setAttr("#quote-category-select","aria-label",copy.chooseQuoteCategory);setAttr("#quote-order-toggle","aria-label",copy.switchQuoteOrder);setAttr("#quote-order-toggle","title",copy.toggleQuoteOrder);const _qot=document.getElementById("quote-order-toggle");if(_qot){let _forward=true;try{_forward=clickTextForward}catch(e){}_qot.textContent=_forward?copy.quoteOrder:copy.quoteReverse}
  localStorage.setItem("languageMode",safe);live2dReturnMessage=copy.live2dReturnMessage;playModeUI();updateMusicButtonState();syncLive2dToggleUI();renderMusicLibraryList();syncMusicLibraryMuteUI();updateMusicLibraryPlayState();
};
const setSidebarCollapsed=(collapsed)=>{
  document.body.classList.toggle("sidebar-collapsed",collapsed);
  if(sidebarToggle)sidebarToggle.setAttribute("aria-pressed",String(collapsed));
  localStorage.setItem("sidebarCollapsed",String(collapsed));
  applyLanguage(currentLanguage);
};
let sidebarActiveLockId=null,sidebarActiveLockTimer=null;
const updateSidebarActive=(targetId=null)=>{
  const sections=["hero","about","projects","music-library","contact","page-bottom"].map(id=>document.getElementById(id)).filter(Boolean);
  const scrollMax=document.documentElement.scrollHeight-window.innerHeight;
  const atPageEnd=scrollMax>0&&window.scrollY>=scrollMax-Math.min(180,window.innerHeight*0.18);
  const probeY=Math.min(window.innerHeight*0.38,360);
  const hashId=window.location.hash?decodeURIComponent(window.location.hash.slice(1)):"";
  const endTarget=targetId||sidebarActiveLockId||hashId;
  const current=targetId||sidebarActiveLockId||(atPageEnd&&["contact","page-bottom"].includes(endTarget)?endTarget:sections.reduce((active,section)=>section.getBoundingClientRect().top<=probeY?section.id:active,"hero"));
  const activeMap={hero:"home",about:"about",projects:"projects","music-library":"music",contact:"contact","page-bottom":"settings"};
  sidebarLinks.forEach(link=>link.classList.toggle("active",link.dataset.navKey===activeMap[current]));
};
const scrollToSidebarTarget=(targetId)=>{
  if(targetId!=="page-bottom")return;
  const scrollBottom=()=>window.scrollTo({top:document.documentElement.scrollHeight,left:0,behavior:"smooth"});
  requestAnimationFrame(()=>requestAnimationFrame(scrollBottom));
};
const lockSidebarActive=(targetId)=>{
  sidebarActiveLockId=targetId;
  updateSidebarActive(targetId);
  window.clearTimeout(sidebarActiveLockTimer);
  sidebarActiveLockTimer=window.setTimeout(()=>{sidebarActiveLockId=null;updateSidebarActive()},1800);
};
if(localStorage.getItem("sidebarCollapsed")==="true")document.body.classList.add("sidebar-collapsed");
player.addEventListener("timeupdate",progress);player.addEventListener("loadedmetadata",progress);player.addEventListener("durationchange",progress);player.addEventListener("canplay",progress);player.addEventListener("seeked",progress);player.addEventListener("playing",startMusicProgressLoop);player.addEventListener("play",startMusicProgressLoop);player.addEventListener("pause",stopMusicProgressLoop);player.addEventListener("ended",()=>{stopMusicProgressLoop();if(!isPagePaused)playNext()});if(musicSeekInput){musicSeekInput.addEventListener("input",()=>{_musicSeekDragging=true;const v=Number(musicSeekInput.value),max=Number(musicSeekInput.max);if(max>0)musicSeekInput.style.setProperty("--seek",(v/max*100)+"%")});musicSeekInput.addEventListener("change",()=>{const v=Number(musicSeekInput.value);_musicSeekDragging=false;if(Number.isFinite(player.duration)&&player.duration>0)player.currentTime=v})}
/* ==== 音乐收藏模块 ==== */
const getMusicFallbackTracks=()=>Object.entries(musicCount).flatMap(([role,count])=>Array.from({length:count},(_,index)=>({
  id:`local-${role}-${index+1}`,
  title:`${names[role]||role} BGM ${index+1}`,
  artist:"",
  album:"",
  artwork:"",
  audioUrl:`assets/music/${role}/${index+1}.mp3`,
  source:"",
  group:"local",
  role,
  roleName:names[role]||role,
  trackNumber:index+1
})));
let musicLocalTracks=[],musicLibraryTracks=[],musicLibraryIndex=0,musicLibrarySeekDragging=false,musicLibraryLoaded=false;
const setMusicLibraryStatus=(text)=>{if(musicLibraryStatus)musicLibraryStatus.textContent=text};
const getMusicTrackIndex=(track)=>musicLibraryTracks.findIndex(item=>item.id===track?.id);
const syncMusicTrackGroups=()=>{
  const activeId=musicLibraryTracks[musicLibraryIndex]?.id;
  musicLibraryTracks=[...musicLocalTracks];
  const nextIndex=musicLibraryTracks.findIndex(track=>track.id===activeId);
  musicLibraryIndex=nextIndex>=0?nextIndex:Math.min(musicLibraryIndex,Math.max(0,musicLibraryTracks.length-1));
  if(musicLocalCount)musicLocalCount.textContent=String(musicLocalTracks.length);
};
const getAdjacentMusicIndex=(delta)=>{
  const visibleTracks=musicLibraryTracks.filter(track=>track.audioUrl);
  if(!visibleTracks.length)return -1;
  const currentId=musicLibraryTracks[musicLibraryIndex]?.id;
  const currentVisibleIndex=Math.max(0,visibleTracks.findIndex(track=>track.id===currentId));
  const nextTrack=visibleTracks[(currentVisibleIndex+delta+visibleTracks.length)%visibleTracks.length];
  return getMusicTrackIndex(nextTrack);
};
/* 恢复已保存的缩略图滚动位置（CSS 自动处理图片缩放，无需 JS fit） */
const restoreThumbScroll=(role,wrap)=>{
  if(!wrap)return;
  try{
    const saved=localStorage.getItem(`music-thumb-scroll-${role}`);
    if(saved){
      const pos=JSON.parse(saved);
      // 延迟一帧确保布局完成再设置滚动位置
      requestAnimationFrame(()=>{
        wrap.scrollLeft=pos.sl||0;
        wrap.scrollTop=pos.st||0;
      });
    }
  }catch(e){}
};
/* 保存所有缩略图的滚动位置到 localStorage，返回 {saved, total} */
const saveAllThumbScrollPositions=()=>{
  let saved=0,total=0;
  document.querySelectorAll(".music-role-thumb-wrap").forEach(wrap=>{
    const card=wrap.closest(".music-role-group");
    const role=card?.dataset.role;
    if(!role)return;
    total++;
    try{
      localStorage.setItem(`music-thumb-scroll-${role}`,JSON.stringify({sl:wrap.scrollLeft,st:wrap.scrollTop}));
      saved++;
    }catch(e){}
  });
  return {saved,total};
};
const renderTrackList=(listEl,tracks=[])=>{
  if(!listEl)return;
  listEl.replaceChildren();
  const groupedTracks=tracks.reduce((groups,track)=>{
    const key=track.role||"local";
    if(!groups.has(key))groups.set(key,{role:key,roleName:track.roleName||key,tracks:[]});
    groups.get(key).tracks.push(track);
    return groups;
  },new Map());
  const orderedRoles=[...bgRoleOrder,...groupedTracks.keys()].filter((role,index,self)=>groupedTracks.has(role)&&self.indexOf(role)===index);
  orderedRoles.forEach(role=>{
    const group=groupedTracks.get(role);

    const card=document.createElement("button");
    card.type="button";
    card.className="music-role-group";
    card.dataset.role=role;
    card.setAttribute("aria-label",currentLanguage==="en"?`Play ${group.roleName}'s first track`:`播放${group.roleName}的第一首歌曲`);
    card.setAttribute("aria-pressed","false");

    // 头像
    const thumbWrap=document.createElement("div");
    thumbWrap.className="music-role-thumb-wrap";
    const img=document.createElement("img");
    img.className="music-role-thumb-sm";
    img.src=`assets/thumbnails/${role}.jpg`;
    img.alt="";
    img.loading="lazy";
    img.decoding="async";
    img.onerror=function(){this.style.opacity="0.3"};
    // CSS 自动处理图片缩放+溢出滚动；这里只恢复已保存的滚动位置
    img.onload=function(){
      restoreThumbScroll(role,thumbWrap);
    };
    if(img.complete&&img.naturalWidth>0){
      restoreThumbScroll(role,thumbWrap);
    }
    thumbWrap.appendChild(img);

    // 信息行：名字 + 歌曲数 + 图片数
    const info=document.createElement("div");
    info.className="music-role-info";

    const nameEl=document.createElement("span");
    nameEl.className="music-role-name";
    nameEl.textContent=group.roleName;
    nameEl.title=group.roleName;

    const counts=document.createElement("span");
    counts.className="music-role-counts";

    const songCount=document.createElement("span");
    songCount.className="music-role-count";
    songCount.textContent=ui("songCountTemplate").replace("{n}",String(group.tracks.length));

    const imgCount=document.createElement("span");
    imgCount.className="music-role-img-count";
    imgCount.textContent=ui("imageCountTemplate").replace("{n}",String(bgCount[role]||0));

    counts.appendChild(songCount);
    counts.appendChild(imgCount);
    info.appendChild(nameEl);
    info.appendChild(counts);
    card.appendChild(thumbWrap);
    card.appendChild(info);

    // 点击卡片：切换角色并播放第一首曲目
    card.addEventListener("click",()=>{
      if(group.tracks.length>0){
        const firstTrack=group.tracks[0];
        const index=musicLibraryTracks.findIndex(item=>item.id===firstTrack.id);
        if(index>=0)setMusicLibraryTrack(index,{autoplay:true,syncImage:true});
      }
    });

    listEl.appendChild(card);
  });
};
const renderMusicLibraryList=()=>{
  syncMusicTrackGroups();
  renderTrackList(musicLocalList,musicLocalTracks);
  syncMusicLibraryActive();
};
const syncMusicLibraryActive=()=>{
  const activeTrack=musicLibraryTracks[musicLibraryIndex];
  document.querySelectorAll(".music-role-group").forEach(group=>{const active=group.dataset.role===activeTrack?.role;group.classList.toggle("is-active",active);group.setAttribute("aria-pressed",String(active))});
};
const setMusicLibraryTrack=(index,{autoplay=false,syncImage=false}={})=>{
  if(!musicLibraryAudio||!musicLibraryTracks.length)return;
  musicLibraryIndex=(index+musicLibraryTracks.length)%musicLibraryTracks.length;
  const track=musicLibraryTracks[musicLibraryIndex];
  if(!track.audioUrl){
    setMusicLibraryStatus(ui("noPlayableTemplate").replace("{title}",track.title));
    syncMusicLibraryActive();
    return;
  }
  musicLibraryAudio.src=track.audioUrl;
  musicLibraryAudio.load();
  if(musicLibraryTitle)musicLibraryTitle.textContent=track.title;
  if(musicLibraryTitle)musicLibraryTitle.title=track.title;
  if(musicLibraryArtist)musicLibraryArtist.textContent=track.roleName||"";
  if(musicLibraryArtist)musicLibraryArtist.title=track.roleName||"";
  if(musicLibrarySource)musicLibrarySource.textContent="";
  if(musicLibrarySource)musicLibrarySource.title="";
  syncMusicLibraryActive();
  drawMusicLibraryProgress();
  if(syncImage&&track.role)setBg(track.role);
  if(autoplay){isPagePaused=true;player.pause();musicLibraryAudio.play().catch(()=>{})}
};
const drawMusicLibraryProgress=()=>{
  if(!musicLibraryAudio)return;
  const d=musicLibraryAudio.duration,t=musicLibraryAudio.currentTime;
  if(musicLibraryTime)musicLibraryTime.textContent=`${fmtTime(t)} / ${Number.isFinite(d)&&d>0?fmtTime(d):"00:00"}`;
  if(!musicLibraryProgress||musicLibrarySeekDragging)return;
  if(Number.isFinite(d)&&d>0){
    musicLibraryProgress.max=String(d);
    musicLibraryProgress.value=String(t);
    musicLibraryProgress.style.setProperty("--library-seek",(t/d*100)+"%");
  }else{
    musicLibraryProgress.value="0";
    musicLibraryProgress.style.setProperty("--library-seek","0%");
  }
};
const syncMusicLibraryMuteUI=()=>{
  if(!musicLibraryMute||!musicLibraryAudio)return;
  const muted=musicLibraryAudio.muted;
  musicLibraryMute.classList.toggle("is-muted",muted);
  musicLibraryMute.setAttribute("aria-label",muted?ui("unmuteMusic"):ui("muteMusic"));
  musicLibraryMute.setAttribute("title",muted?ui("unmuteMusic"):ui("muteMusic"));
};
const updateMusicLibraryPlayState=()=>{
  if(!musicLibraryPlay||!musicLibraryAudio)return;
  const playing=!musicLibraryAudio.paused&&!musicLibraryAudio.ended;
  musicLibraryPlay.classList.toggle("is-playing",playing);
  musicLibraryPlay.setAttribute("aria-pressed",String(playing));
  musicLibraryPlay.setAttribute("aria-label",playing?ui("pauseBtn"):ui("playBtn"));
};
const commitMusicLibrarySeek=()=>{
  if(!musicLibraryAudio||!musicLibraryProgress)return;
  const value=Number(musicLibraryProgress.value)||0;
  const duration=musicLibraryAudio.duration;
  if(Number.isFinite(duration)&&duration>0){
    musicLibraryAudio.currentTime=Math.min(duration,Math.max(0,value));
    drawMusicLibraryProgress();
  }
};
const prevMusicLibraryTrack=()=>{
  const role=currentRole;
  const roleTracks=musicLibraryTracks.filter(t=>t.role===role&&t.audioUrl);
  if(!roleTracks.length)return;
  const currentId=musicLibraryTracks[musicLibraryIndex]?.id;
  const currentIdx=roleTracks.findIndex(t=>t.id===currentId);
  const prevTrack=roleTracks[(currentIdx-1+roleTracks.length)%roleTracks.length];
  const index=musicLibraryTracks.findIndex(t=>t.id===prevTrack.id);
  if(index>=0)setMusicLibraryTrack(index,{autoplay:true});
};
const nextMusicLibraryTrack=()=>{
  const role=currentRole;
  const roleTracks=musicLibraryTracks.filter(t=>t.role===role&&t.audioUrl);
  if(!roleTracks.length)return;
  const currentId=musicLibraryTracks[musicLibraryIndex]?.id;
  const currentIdx=roleTracks.findIndex(t=>t.id===currentId);
  const nextTrack=roleTracks[(currentIdx+1)%roleTracks.length];
  const index=musicLibraryTracks.findIndex(t=>t.id===nextTrack.id);
  if(index>=0)setMusicLibraryTrack(index,{autoplay:true});
};
const syncMusicLibraryHeight=()=>{
  const details=document.querySelector(".music-library-details");
  if(!details||!details.open)return;
  const left=document.querySelector(".music-library-left");
  const stage=document.querySelector(".music-library-stage");
  // 窄屏/移动端是单列堆叠，左栏不应被压成舞台高度（否则轨道图会被拦腰截断）
  if(document.body.classList.contains("layout-mobile")||window.innerWidth<=1068){
    left?.style.removeProperty("min-height");
    left?.style.removeProperty("max-height");
    return;
  }
  if(left&&stage){const h=stage.offsetHeight;left.style.minHeight=h+"px";left.style.maxHeight=h+"px"}
};
const loadMusicLibrary=async()=>{
  if(!musicLibraryAudio||musicLibraryLoaded)return;
  musicLibraryLoaded=true;
  musicLocalTracks=getMusicFallbackTracks();
  syncMusicTrackGroups();
  setMusicLibraryStatus(ui("musicCountTemplate").replace("{n}",String(musicLocalTracks.length)));
  renderMusicLibraryList();
  const firstPlayable=musicLibraryTracks.find(track=>track.audioUrl&&track.role===currentRole)||musicLibraryTracks.find(track=>track.audioUrl);
  if(firstPlayable)setMusicLibraryTrack(getMusicTrackIndex(firstPlayable),{autoplay:false,syncImage:true});
  requestAnimationFrame(()=>{syncMusicLibraryHeight();requestAnimationFrame(()=>syncMusicLibraryHeight())});
};
const _musicDetails=document.querySelector(".music-library-details");
if(_musicDetails)_musicDetails.addEventListener("toggle",()=>{if(_musicDetails.open){loadMusicLibrary();requestAnimationFrame(()=>{syncMusicLibraryHeight();requestAnimationFrame(()=>syncMusicLibraryHeight())})}});
/* ==== 音乐收藏 · 全息环形频谱（原生 Web Audio，零依赖零体积） ====
 * 用 AudioContext + AnalyserNode 驱动舞台上的 <canvas>，并把音频能量写进
 * 单个 CSS 变量 --music-level，脉动全部交给 CSS 消费（每帧只写 1 个变量）。
 * 注意：同一 <audio> 只能 createMediaElementSource 一次，且必须接回
 * destination，否则音乐会被静音。
 */
const musicSpectrum=(()=>{
  const canvas=document.getElementById("music-spectrum");
  const stage=document.querySelector(".music-library-stage");
  const audio=musicLibraryAudio;
  const details=document.querySelector(".music-library-details");
  const noop={resume(){},sync(){}};
  if(!canvas||!stage||!audio)return noop;

  const reduceMotion=prefersReducedMotion();
  let audioCtx=null,analyser=null,freqData=null,ctx=null,rafId=0,idlePhase=0,w=0,h=0;
  let accent=[41,151,255],accentTimer=0;

  // 主题色跟随 6 套 design-* 切换：每秒重读一次 getComputedStyle，避免每帧读取
  const readAccent=()=>{
    try{
      const raw=getComputedStyle(stage).getPropertyValue("--music-accent").trim();
      const hex=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(raw);
      if(hex){
        let body=hex[1];
        if(body.length===3)body=body[0]+body[0]+body[1]+body[1]+body[2]+body[2];
        accent=[parseInt(body.slice(0,2),16),parseInt(body.slice(2,4),16),parseInt(body.slice(4,6),16)];
      }
    }catch{}
  };

  const ensureAnalyser=()=>{
    if(analyser)return analyser;
    const Ctx=window.AudioContext||window.webkitAudioContext;
    if(!Ctx)return null;
    try{
      audioCtx=new Ctx();
      const source=audioCtx.createMediaElementSource(audio);
      analyser=audioCtx.createAnalyser();
      analyser.fftSize=2048;
      analyser.smoothingTimeConstant=0.82;
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      freqData=new Uint8Array(analyser.frequencyBinCount);
    }catch{
      analyser=null;
    }
    return analyser;
  };
  const resize=()=>{
    const cw=stage.clientWidth,ch=stage.clientHeight;
    if(!cw||!ch)return false;
    const dpr=Math.min(2,window.devicePixelRatio||1);
    w=cw;h=ch;
    canvas.width=Math.round(cw*dpr);
    canvas.height=Math.round(ch*dpr);
    ctx=canvas.getContext("2d");
    if(ctx)ctx.setTransform(dpr,0,0,dpr,0,0);
    readAccent();
    return true;
  };
  const draw=()=>{
    if(!ctx||!w||!h)return;
    const [ar,ag,ab]=accent;
    const min=Math.min(w,h),base=min*0.40,bars=96;
    const playing=!audio.paused&&!audio.ended&&audio.readyState>2;
    const live=playing&&analyser&&freqData;
    if(live)analyser.getByteFrequencyData(freqData);
    ctx.clearRect(0,0,w,h);
    ctx.save();
    ctx.translate(w/2,h/2);
    let level=0;
    for(let i=0;i<bars;i++){
      let value;
      if(live){
        value=freqData[Math.floor(Math.pow(i/bars,1.5)*freqData.length*0.72)]/255;
      }else{
        value=0.1+0.05*Math.sin(idlePhase*0.9+i*0.35);
      }
      level+=value;
      const angle=(i/bars)*Math.PI*2-Math.PI/2;
      const len=3+value*min*0.085;
      const alpha=(0.16+value*0.7).toFixed(3);
      ctx.beginPath();
      ctx.strokeStyle=`rgba(${ar},${ag},${ab},${alpha})`;
      ctx.lineWidth=2.2;
      ctx.moveTo(Math.cos(angle)*base,Math.sin(angle)*base);
      ctx.lineTo(Math.cos(angle)*(base+len),Math.sin(angle)*(base+len));
      ctx.stroke();
    }
    level/=bars;
    stage.style.setProperty("--music-level",level.toFixed(3));
    const duration=audio.duration;
    const progress=Number.isFinite(duration)&&duration>0?Math.min(1,audio.currentTime/duration):0;
    const ringR=base-min*0.035;
    ctx.beginPath();
    ctx.strokeStyle=`rgba(${ar},${ag},${ab},0.22)`;
    ctx.lineWidth=2.5;
    ctx.arc(0,0,ringR,0,Math.PI*2);
    ctx.stroke();
    if(progress>0){
      ctx.beginPath();
      ctx.strokeStyle=`rgba(${ar},${ag},${ab},${(0.7+level*0.3).toFixed(3)})`;
      ctx.lineWidth=3;
      ctx.lineCap="round";
      ctx.arc(0,0,ringR,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);
      ctx.stroke();
    }
    ctx.restore();
  };
  const loop=()=>{
    rafId=0;
    if(document.hidden||!details?.open)return;
    idlePhase+=0.016;
    draw();
    rafId=requestAnimationFrame(loop);
  };
  const start=()=>{
    if(reduceMotion||rafId||!details?.open)return;
    if(!resize())return;
    // 按时间而不是按帧刷新主题色：低帧率设备上按帧计数会明显滞后
    if(!accentTimer)accentTimer=setInterval(readAccent,400);
    rafId=requestAnimationFrame(loop);
  };
  const stop=()=>{
    if(rafId){cancelAnimationFrame(rafId);rafId=0}
    if(accentTimer){clearInterval(accentTimer);accentTimer=0}
  };
  const sync=()=>{
    if(details?.open&&resize())draw();
  };
  window.addEventListener("resize",()=>{stop();sync();start()},{passive:true});
  document.addEventListener("visibilitychange",()=>{if(document.hidden)stop();else start()});
  if(details)details.addEventListener("toggle",()=>{if(details.open){sync();start()}else stop()});
  if(reduceMotion)sync();
  // 详情面板若在加载时就是展开的，toggle 事件不会触发，这里补一次启动
  else if(details?.open)start();

  return {
    // 必须在用户手势里调用，否则移动端/Chrome 的 AudioContext 会一直是 suspended
    resume(){
      ensureAnalyser();
      if(audioCtx&&audioCtx.state==="suspended")audioCtx.resume().catch(()=>{});
      sync();
      start();
    },
    sync
  };
})();
if(musicLibraryAudio){
  musicLibraryAudio.volume=0.7;
  musicLibraryAudio.addEventListener("play",()=>{player.pause();isPagePaused=true;controls();updateMusicLibraryPlayState();musicSpectrum.resume()});
  musicLibraryAudio.addEventListener("pause",updateMusicLibraryPlayState);
  musicLibraryAudio.addEventListener("ended",()=>{const nextIndex=getAdjacentMusicIndex(1);if(nextIndex>=0)setMusicLibraryTrack(nextIndex,{autoplay:true})});
  ["timeupdate","loadedmetadata","durationchange","canplay","seeked"].forEach(eventName=>musicLibraryAudio.addEventListener(eventName,drawMusicLibraryProgress));
  if(musicLibraryPlay)musicLibraryPlay.addEventListener("click",()=>{if(!musicLibraryTracks.length)return;musicSpectrum.resume();if(musicLibraryAudio.paused)musicLibraryAudio.play().catch(()=>{});else musicLibraryAudio.pause()});
  if(musicLibraryProgress){
    musicLibraryProgress.addEventListener("input",()=>{musicLibrarySeekDragging=true;const v=Number(musicLibraryProgress.value),max=Number(musicLibraryProgress.max);if(max>0)musicLibraryProgress.style.setProperty("--library-seek",(v/max*100)+"%");commitMusicLibrarySeek()});
    const finishSeek=()=>{musicLibrarySeekDragging=false;commitMusicLibrarySeek();drawMusicLibraryProgress()};
    musicLibraryProgress.addEventListener("change",finishSeek);
    musicLibraryProgress.addEventListener("pointerup",finishSeek);
    musicLibraryProgress.addEventListener("keyup",finishSeek);
  }
  if(musicLibraryVolume){
    musicLibraryVolume.addEventListener("input",()=>{
      const v=Math.min(100,Math.max(0,Number(musicLibraryVolume.value)||0));
      musicLibraryAudio.volume=v/100;
      musicLibraryAudio.muted=false;
      syncMusicLibraryMuteUI();
      musicLibraryVolume.style.setProperty("--library-vol",`${v}%`);
    });
  }
  if(musicLibraryMute){
    musicLibraryMute.addEventListener("click",()=>{
      musicLibraryAudio.muted=!musicLibraryAudio.muted;
      syncMusicLibraryMuteUI();
    });
  }
  const _saveThumbPosBtn=document.getElementById("music-save-thumb-pos");
  if(_saveThumbPosBtn){
    _saveThumbPosBtn.addEventListener("click",()=>{
      const result=saveAllThumbScrollPositions();
      if(result.total===0){
        showToast(ui("thumbPosNoData"));
      }else if(result.saved===result.total){
        showToast(ui("thumbPosSaved").replace("{n}",String(result.saved)));
      }else{
        showToast(ui("thumbPosPartial").replace("{s}",String(result.saved)).replace("{t}",String(result.total)).replace("{f}",String(result.total-result.saved)));
      }
    });
  }
  player.addEventListener("play",()=>{if(!musicLibraryAudio.paused)musicLibraryAudio.pause()});
  if(_musicDetails?.open)loadMusicLibrary();
}
const projectAvatarUrl="assets/avatar.png";const loadProjectAvatar=()=>{const saved=localStorage.getItem("sidebarAvatar");const img=new Image();img.onload=()=>{localStorage.setItem("sidebarAvatarSource","project");applySidebarAvatar(projectAvatarUrl+"?v="+Date.now())};img.onerror=()=>{localStorage.removeItem("sidebarAvatarSource");if(saved&&saved.startsWith("data:"))applySidebarAvatar(saved)};img.src=projectAvatarUrl+"?v="+Date.now()};loadProjectAvatar();applyStyle(localStorage.getItem("stylePreset")||"apple");applyLayoutMode(detectLayoutMode());applyLanguage(currentLanguage);controls();playModeUI();updateSidebarActive();
	/* 合成器预热：页面首次加载后 GPU 管线是冷的，第一次切风格时会同时创建图层+过渡导致卡顿。
	   在空闲时短暂启用过渡追踪，触发浏览器预先建立合成图层和过渡管线，用户真正切换时就丝滑了。 */
	const _warmupCompositor=()=>{
	  if(!document.body.classList.contains("style-transitioning")){
	    document.body.classList.add("style-transitioning");
	    requestAnimationFrame(()=>requestAnimationFrame(()=>{
	      document.body.classList.remove("style-transitioning");
	    }));
	  }
	};
	setTimeout(_warmupCompositor,600);
	window.addEventListener("load",()=>setTimeout(_warmupCompositor,400),{once:true});
const bgOn=true,bgRole=localStorage.getItem("bgCharacter")||"02";localStorage.setItem("bgEnabled","true");if(bgToggle)bgToggle.checked=bgOn;if(bgCharacterSelect)bgCharacterSelect.value=bgCount[bgRole]?bgRole:"02";if(bgPlayModeSelect)bgPlayModeSelect.value=bgPlayMode;if(_musicDetails?.open)applyBg(bgOn,bgRole);
if(musicToggle)musicToggle.checked=musicEnabled;if(musicVolumeInput){musicVolumeInput.value=String(Math.round(player.volume*100));musicVolumeInput.style.setProperty("--vol",`${Math.round(player.volume*100)}%`)}[styleSelect,bgCharacterSelect,bgPlayModeSelect,live2dModelSelect].forEach(fit);applyLive2dVisibility();syncLive2dToggleUI();
window.addEventListener("resize",()=>{applyLayoutMode(detectLayoutMode());updateSidebarActive();syncMusicLibraryHeight()},{passive:true});
designStyleButtons.forEach(button=>button.addEventListener("click",()=>applyStyleSmooth(button.dataset.designStyle)));
if(styleSelect)styleSelect.addEventListener("change",e=>applyStyleSmooth(e.target.value,()=>fit(styleSelect)));
if(languageToggle)languageToggle.addEventListener("click",()=>withViewportPreserved(()=>{applyLanguage(currentLanguage==="en"?"zh":"en");showToast(ui("languageUpdated"))},{frames:3,anchor:languageToggle}));
const isLocalEnv=()=>window.location.protocol==="file:"||window.location.hostname==="127.0.0.1"||window.location.hostname==="localhost";
if(sidebarAvatarButton&&sidebarAvatarInput){if(isLocalEnv()){sidebarAvatarButton.addEventListener("click",()=>sidebarAvatarInput.click())}else{sidebarAvatarButton.style.pointerEvents="none";sidebarAvatarButton.title=ui("avatarSetByOwner")}}
if(sidebarAvatarInput)sidebarAvatarInput.addEventListener("change",()=>{if(!isLocalEnv())return;const file=sidebarAvatarInput.files?.[0];if(!file||!file.type.startsWith("image/"))return;const reader=new FileReader();reader.addEventListener("load",async()=>{const src=String(reader.result||"");if(!src)return;try{localStorage.setItem("sidebarAvatar",src);applySidebarAvatar(src);const saved=await fetch("/api/save-avatar",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image:src})}).then(r=>r.ok).catch(()=>false);showToast(saved?ui("avatarSaveProject"):ui("avatarSaveLocal"))}catch{showToast(ui("imageTooLarge"))}});reader.readAsDataURL(file);sidebarAvatarInput.value=""});
if(sidebarToggle)sidebarToggle.addEventListener("click",()=>setSidebarCollapsed(!document.body.classList.contains("sidebar-collapsed")));
sidebarLinks.forEach(link=>link.addEventListener("click",()=>{const href=link.getAttribute("href");if(href?.startsWith("#")){const targetId=href.slice(1);lockSidebarActive(targetId);scrollToSidebarTarget(targetId)}}));
window.addEventListener("scroll",()=>updateSidebarActive(),{passive:true});
document.querySelectorAll(".btn, .social-links a, .jump-btn, .sidebar-link, .design-style-btn, .view-mode-btn, .language-switch, .live2d-settings-toggle, .card").forEach(el=>{
  let frame=0,point;
  el.addEventListener("pointermove",e=>{
    if(prefersReducedMotion()||e.pointerType==="touch")return;
    point={x:e.clientX,y:e.clientY};
    if(frame)return;
    frame=requestAnimationFrame(()=>{
      frame=0;
      const r=el.getBoundingClientRect(),x=(point.x-r.left)/r.width,y=(point.y-r.top)/r.height;
      el.style.setProperty("--mx",`${x*100}%`);el.style.setProperty("--my",`${y*100}%`);
      if(el.classList.contains("card")){
        el.style.setProperty("--tilt-x",`${((.5-y)*2.4).toFixed(2)}deg`);
        el.style.setProperty("--tilt-y",`${((x-.5)*2.4).toFixed(2)}deg`);
      }
    });
  },{passive:true});
  el.addEventListener("pointerleave",()=>{
    cancelAnimationFrame(frame);frame=0;
    ["--mx","--my","--tilt-x","--tilt-y"].forEach(name=>el.style.removeProperty(name));
  });
});
layoutModeButtons.forEach(button=>button.addEventListener("click",()=>withViewportPreserved(()=>{const mode=button.dataset.layoutMode==="mobile"?"mobile":"desktop";applyLayoutMode(mode);if(mode==="desktop")requestAnimationFrame(()=>requestAnimationFrame(()=>{if(typeof applyLive2dSettings==="function")applyLive2dSettings()}));showToast(mode==="mobile"?ui("mobileLayout"):ui("desktopLayout"))},{frames:4})));
if(bgCharacterSelect)bgCharacterSelect.addEventListener("change",e=>withViewportPreserved(()=>{if(_suppressSelectChange){_suppressSelectChange=false;return}localStorage.setItem("bgCharacter",e.target.value);applyBg(true,e.target.value);showToast(ui("bgRoleChanged"))}));
if(bgPlayModeSelect)bgPlayModeSelect.addEventListener("change",e=>withViewportPreserved(()=>{bgPlayMode=e.target.value==="all"?"all":"single";localStorage.setItem("bgPlayMode",bgPlayMode);playModeUI();showToast(ui("playModeUpdated"))}));
if(musicToggle)musicToggle.addEventListener("change",()=>withViewportPreserved(()=>{musicEnabled=musicToggle.checked;localStorage.setItem("musicEnabled",String(musicEnabled));if(musicEnabled){isPagePaused=false;localStorage.setItem("pagePaused","false");clearInterval(bgTimer);if(isViewerEnabled())showScene(currentRole,{withMusic:true})}else{player.pause();scheduleBgOnly()}controls();showToast(musicEnabled?ui("musicOn"):ui("musicOff"))}));
if(musicVolumeInput)musicVolumeInput.addEventListener("input",()=>{const v=Math.min(100,Math.max(0,Number(musicVolumeInput.value)||0));player.volume=v/100;localStorage.setItem("musicVolume",String(player.volume));musicVolumeInput.style.setProperty("--vol",`${v}%`)});
if(live2dModelSelect)live2dModelSelect.addEventListener("change",()=>withViewportPreserved(()=>{const modelKey=getLive2dModelKey(live2dModelSelect.value);localStorage.setItem("live2dModel",modelKey);if(typeof switchLive2dModel==="function")switchLive2dModel(modelKey);showToast(ui("live2dModelChanged"))}));
if(live2dToggleButton)live2dToggleButton.addEventListener("click",()=>withViewportPreserved(()=>{setLive2dEnabled(!live2dEnabled)},{frames:2,anchor:live2dToggleButton}));
let live2dSizeInputFrame=0;
if(live2dSizeInput)live2dSizeInput.addEventListener("input",()=>{if(live2dSizeInputFrame)cancelAnimationFrame(live2dSizeInputFrame);live2dSizeInputFrame=requestAnimationFrame(()=>{live2dSizeInputFrame=0;setLive2dSizePercent(live2dSizeInput.value,{freezePanel:true})})});
if(headerMusicPrevButton)headerMusicPrevButton.addEventListener("click",()=>withViewportPreserved(()=>{prevMusicLibraryTrack();showToast(ui("songChanged"))}));if(headerMusicNextButton)headerMusicNextButton.addEventListener("click",()=>withViewportPreserved(()=>{nextMusicLibraryTrack();showToast(ui("songChanged"))}));if(headerImagePrevButton)headerImagePrevButton.addEventListener("click",()=>withViewportPreserved(()=>{prevImageOnly();showToast(ui("imageChanged"))}));if(headerImageNextButton)headerImageNextButton.addEventListener("click",()=>withViewportPreserved(()=>{nextImageOnly();showToast(ui("imageChanged"))}));
if(pageMuteToggleButton)pageMuteToggleButton.addEventListener("click",()=>withViewportPreserved(()=>{isPagePaused=!isPagePaused;localStorage.setItem("pagePaused",String(isPagePaused));if(isPagePaused){player.pause()}else if(musicEnabled){if(player.src)player.play().then(startMusicProgressLoop).catch(()=>{});else showScene(currentRole,{withMusic:true})}controls();showToast(isPagePaused?ui("musicPausedToast"):ui("musicResumedToast"))}));
if(yearSpan)yearSpan.textContent=String(new Date().getFullYear());
if(launcherMode)requestAnimationFrame(()=>requestAnimationFrame(forceLauncherInitialView));
const revealTargets=document.querySelectorAll(".section,.card,.about-panel,.about-sub-panel,.side-nav,.site-footer");
if("IntersectionObserver" in window){
  const revealObserver=new IntersectionObserver((entries,observer)=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.classList.add("is-revealed");observer.unobserve(entry.target)})},{threshold:0.12,rootMargin:"0px 0px -8% 0px"});
  revealTargets.forEach((el,index)=>{el.classList.add("reveal-on-scroll");el.style.transitionDelay=`${index%3*20}ms`;revealObserver.observe(el)});
}else{
  revealTargets.forEach(el=>el.classList.add("is-revealed"));
}
let live2dSettingsTimer=null,live2dControlsActive=false,live2dLayoutFrame=0;
const queueLive2dFrame=window.requestAnimationFrame?.bind(window)||((callback)=>setTimeout(callback,16));
const LIVE2D_EDGE_MARGIN=12;
const getLive2dBaseSize=()=>{const w=Math.min(280,window.innerWidth*0.48),h=Math.min(560,window.innerHeight*0.82);return {width:w,height:h}};
const getLive2dMaxScale=()=>{const {width,height}=getLive2dBaseSize();const maxW=(window.innerWidth-LIVE2D_EDGE_MARGIN*2)/Math.max(1,width),maxH=(window.innerHeight-LIVE2D_EDGE_MARGIN*2)/Math.max(1,height);return Math.max(0.6,Math.min(1.6,maxW,maxH))};
const normalizeLive2dSizePercent=(value)=>{const requested=Math.min(160,Math.max(60,Number(value)||100));return Math.round(Math.min(requested,getLive2dMaxScale()*100))};
const getLive2dScale=()=>Math.min(getLive2dMaxScale(),Math.max(0.6,Number(live2dWidget?.style.getPropertyValue("--live2d-size"))||normalizeLive2dSizePercent(localStorage.getItem("live2dSize"))/100));
const getLive2dMetrics=(scale=getLive2dScale(),custom=live2dWidget?.classList.contains("live2d-custom-position"))=>{const {width,height}=getLive2dBaseSize();const visualWidth=width*scale,visualHeight=height*scale;return {scale,width,height,visualWidth,visualHeight,offsetX:0,offsetY:custom?0:height-visualHeight}};
const clampLive2dVisualLeftTop=(x,y,scale=getLive2dScale())=>{const {visualWidth,visualHeight}=getLive2dMetrics(scale,true);const maxX=window.innerWidth-LIVE2D_EDGE_MARGIN-visualWidth,maxY=window.innerHeight-LIVE2D_EDGE_MARGIN-visualHeight;return {x:clamp(x,LIVE2D_EDGE_MARGIN,Math.max(LIVE2D_EDGE_MARGIN,maxX)),y:clamp(y,LIVE2D_EDGE_MARGIN,Math.max(LIVE2D_EDGE_MARGIN,maxY))}};
const positionLive2dChrome=({freezePanel=false}={})=>{
  if(!live2dWidget)return;
  const rect=live2dWidget.getBoundingClientRect();
  const rightSpace=window.innerWidth-rect.right;
  const leftSpace=rect.left;
  const panelWidth=live2dSettingsPanel?.offsetWidth||264;
  const requiredLeftSpace=freezePanel?64:panelWidth+12;
  const canPlaceRight=rightSpace>=64;
  const canPlaceLeft=leftSpace>=requiredLeftSpace;
  const previousSide=live2dWidget.dataset.controlsSide;
  let placeRight=true;
  if(previousSide==="right"&&canPlaceRight)placeRight=true;
  else if(previousSide==="left"&&canPlaceLeft)placeRight=false;
  else if(canPlaceRight&&!canPlaceLeft)placeRight=true;
  else if(!canPlaceRight&&canPlaceLeft)placeRight=false;
  else placeRight=rightSpace>=leftSpace;
  live2dWidget.dataset.controlsSide=placeRight?"right":"left";
  const toggleX=placeRight?rect.width+8:-52;
  const toggleY=clamp(rect.height*0.42,84,Math.max(84,rect.height-116));
  live2dWidget.style.setProperty("--live2d-toggle-x",`${toggleX}px`);
  live2dWidget.style.setProperty("--live2d-toggle-y",`${toggleY}px`);
  // Freeze in viewport coordinates: shrinking a bottom-anchored character moves
  // its top, so keeping a relative offset would push focused controls offscreen.
  const previousX=Number(live2dWidget.dataset.panelViewportX);
  const previousY=Number(live2dWidget.dataset.panelViewportY);
  const desiredX=freezePanel&&Number.isFinite(previousX)?previousX:placeRight?rect.right+12:rect.left-panelWidth-12;
  const desiredY=freezePanel&&Number.isFinite(previousY)?previousY:rect.top+toggleY+32;
  const panelHeight=Math.max(live2dSettingsPanel?.offsetHeight||300,Math.ceil(live2dSettingsPanel?.getBoundingClientRect().height||300));
  const panelX=clamp(desiredX,8,Math.max(8,window.innerWidth-panelWidth-8));
  const panelY=clamp(desiredY,8,Math.max(8,window.innerHeight-panelHeight-8));
  live2dWidget.dataset.panelViewportX=String(panelX);
  live2dWidget.dataset.panelViewportY=String(panelY);
  live2dWidget.style.setProperty("--live2d-panel-x",`${panelX-rect.left}px`);
  live2dWidget.style.setProperty("--live2d-panel-y",`${panelY-rect.top}px`);
};
const settleLive2dChrome=({freezePanel=false,frames=3}={})=>{
  let pending=Math.max(1,frames);
  const tick=()=>{
    positionLive2dChrome({freezePanel});
    scheduleLive2dRelayout();
    pending-=1;
    if(pending>0)requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const setLive2dSizePercent=(value,{freezePanel=false}={})=>{
  if(!live2dWidget)return normalizeLive2dSizePercent(value);
  const size=normalizeLive2dSizePercent(value);
  localStorage.setItem("live2dSize",String(size));
  live2dWidget.style.setProperty("--live2d-size",String(size/100));
  const custom=live2dWidget.classList.contains("live2d-custom-position");
  if(custom){
    const currentX=Number.parseFloat(live2dWidget.style.left)||live2dWidget.getBoundingClientRect().left,currentY=Number.parseFloat(live2dWidget.style.top)||live2dWidget.getBoundingClientRect().top;
    const next=clampLive2dVisualLeftTop(currentX,currentY,size/100);
    live2dWidget.style.setProperty("--live2d-x",`${next.x}px`);
    live2dWidget.style.setProperty("--live2d-y",`${next.y}px`);
    live2dWidget.style.left=`${next.x}px`;
    live2dWidget.style.top=`${next.y}px`;
    localStorage.setItem("live2dX",String(next.x));
    localStorage.setItem("live2dY",String(next.y));
  }
  if(live2dSizeInput)live2dSizeInput.value=String(size);
  if(live2dSizeValue)live2dSizeValue.textContent=`${size}%`;
  positionLive2dChrome({freezePanel});
  scheduleLive2dRelayout();
  settleLive2dChrome({freezePanel,frames:3});
  return size
};
const isLive2dSettingsTarget=(target)=>Boolean(target?.closest?.(".live2d-settings-toggle,.live2d-settings-panel,.live2d-resize-handle"));
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
  if(!keep)live2dSettingsTimer=setTimeout(hideLive2dSettingsButton,3600);
};
const setLive2dLoading=(loading)=>{if(live2dWidget)live2dWidget.classList.toggle("live2d-loading",Boolean(loading))};
const setLive2dSettingsOpen=(open)=>{
  if(!live2dWidget)return;
  live2dWidget.classList.toggle("live2d-settings-open",open);
  if(live2dSettingsPanel)live2dSettingsPanel.inert=!open;
  if(live2dSettingsToggle)live2dSettingsToggle.setAttribute("aria-expanded",String(open));
  positionLive2dChrome();
  if(open&&!prefersReducedMotion()&&window.Motion&&live2dSettingsPanel){
    Motion.animate(live2dSettingsPanel,{opacity:[0,1]},{duration:.18,ease:[.22,1,.36,1]});
  }
  showLive2dSettingsButton({keep:open});
  if(!open){unmarkLive2dControlsActive();live2dSettingsTimer=setTimeout(hideLive2dSettingsButton,3000)}
};
if(live2dSettingsToggle)live2dSettingsToggle.addEventListener("click",e=>{
  e.stopPropagation();
  setLive2dSettingsOpen(!live2dWidget?.classList.contains("live2d-settings-open"));
});
$("#live2d-settings-close")?.addEventListener("click",()=>{setLive2dSettingsOpen(false);live2dSettingsToggle?.focus()});
document.addEventListener("keydown",event=>{
  if(event.key!=="Escape"||!live2dWidget?.classList.contains("live2d-settings-open"))return;
  const hadFocus=live2dSettingsPanel?.contains(document.activeElement);
  setLive2dSettingsOpen(false);
  if(hadFocus)live2dSettingsToggle?.focus();
});
$("#live2d-next-model")?.addEventListener("click",()=>{
  if(!live2dModelSelect)return;
  const options=[...live2dModelSelect.options].filter(option=>!option.disabled);
  const index=options.findIndex(option=>option.value===live2dModelSelect.value);
  if(!options.length)return;
  live2dModelSelect.value=options[(index+1)%options.length].value;
  live2dModelSelect.dispatchEvent(new Event("change",{bubbles:true}));
});
document.querySelectorAll("[data-live2d-size-step]").forEach(button=>button.addEventListener("click",()=>{
  setLive2dSizePercent(Number(live2dSizeInput?.value||100)+Number(button.dataset.live2dSizeStep),{freezePanel:true});
}));
$("#live2d-size-reset")?.addEventListener("click",()=>setLive2dSizePercent(100,{freezePanel:true}));
if(live2dSettingsPanel){
  live2dSettingsPanel.addEventListener("click",e=>e.stopPropagation());
  live2dSettingsPanel.addEventListener("pointerdown",markLive2dControlsActive);
  live2dSettingsPanel.addEventListener("focusin",markLive2dControlsActive);
  live2dSettingsPanel.addEventListener("focusout",()=>setTimeout(()=>{if(!live2dSettingsPanel.contains(document.activeElement))unmarkLive2dControlsActive()},0));
  live2dSettingsPanel.addEventListener("input",markLive2dControlsActive);
}
window.addEventListener("pointerup",unmarkLive2dControlsActive,{passive:true});
window.addEventListener("pointercancel",unmarkLive2dControlsActive,{passive:true});
/*
 * 尺寸手柄（2026-10-06）
 * 尺寸按「指针到看板娘左边缘的水平距离 ÷ 基准宽度」换算，而不是用位移量：
 * 看板娘底部锚定时（默认 bottom:0）长高会让上边缘上移，用位移量会出现"往下拖反而变小"。
 * 用绝对距离则永远是"向右拖变大、向左拖变小"。
 * 归一化与持久化都复用 setLive2dSizePercent，所以和面板里的滑块完全同一条路径。
 */
const live2dResizeHandle=$("#live2d-resize-handle");
if(live2dResizeHandle){
  let live2dResizing=false,live2dResizeAnchorLeft=0,live2dResizeBaseWidth=1,live2dResizeFrame=0,live2dResizePending=null;
  const endLive2dResize=(event)=>{
    if(!live2dResizing)return;
    live2dResizing=false;
    live2dWidget?.classList.remove("live2d-resizing");
    unmarkLive2dControlsActive();
    try{live2dResizeHandle.releasePointerCapture?.(event?.pointerId)}catch{}
    settleLive2dChrome({frames:3});
  };
  live2dResizeHandle.addEventListener("pointerdown",event=>{
    if(event.button!==undefined&&event.button!==0)return;
    const rect=live2dWidget?.getBoundingClientRect();
    if(!rect)return;
    live2dResizing=true;
    live2dResizeAnchorLeft=rect.left;
    live2dResizeBaseWidth=Math.max(1,getLive2dBaseSize().width);
    live2dWidget.classList.add("live2d-resizing");
    markLive2dControlsActive();
    // 手柄是 <button>，不阻止默认会抢焦点并让 pointermove 中断
    event.preventDefault();
    event.stopPropagation();
    try{live2dResizeHandle.setPointerCapture?.(event.pointerId)}catch{}
  });
  live2dResizeHandle.addEventListener("pointermove",event=>{
    if(!live2dResizing)return;
    const percent=(event.clientX-live2dResizeAnchorLeft)/live2dResizeBaseWidth*100;
    live2dResizePending=percent;
    if(live2dResizeFrame)return;
    live2dResizeFrame=queueLive2dFrame(()=>{
      live2dResizeFrame=0;
      if(live2dResizePending===null)return;
      setLive2dSizePercent(live2dResizePending,{freezePanel:true});
      live2dResizePending=null;
    });
  });
  live2dResizeHandle.addEventListener("pointerup",endLive2dResize);
  live2dResizeHandle.addEventListener("pointercancel",endLive2dResize);
  live2dResizeHandle.addEventListener("lostpointercapture",endLive2dResize);
  // 键盘可达：方向键 ±5%，让无法拖拽的用户也能调整
  live2dResizeHandle.addEventListener("keydown",event=>{
    const step=event.key==="ArrowRight"||event.key==="ArrowUp"?5:event.key==="ArrowLeft"||event.key==="ArrowDown"?-5:0;
    if(!step)return;
    event.preventDefault();
    const current=Number(live2dSizeInput?.value)||getLive2dScale()*100;
    setLive2dSizePercent(normalizeLive2dSizePercent(current+step),{freezePanel:true});
  });
}
document.addEventListener("pointerdown",e=>{
  if(!live2dWidget||!live2dWidget.classList.contains("live2d-settings-visible")&&!live2dWidget.classList.contains("live2d-settings-open"))return;
  if(live2dWidget.contains(e.target))return;
  clearTimeout(live2dSettingsTimer);
  unmarkLive2dControlsActive();
  live2dWidget.classList.remove("live2d-settings-open","live2d-settings-visible");
  if(live2dSettingsPanel)live2dSettingsPanel.inert=true;
  if(live2dSettingsToggle)live2dSettingsToggle.setAttribute("aria-expanded","false");
},true);
const live2dMessages=["好久不见，日子过得好快呢……","大坏蛋！你都多久没理人家了呀，嘤嘤嘤～","嗨～快来逗我玩吧！","拿小拳拳锤你胸口！","记得把小家加入收藏夹哦！","今天也要元气满满。","别戳啦，我在认真看家。","要不要听一首歌放松一下？","角色窗口和音乐现在会一起换啦。","欢迎来到 Sakura_Love 的小窝。","偷偷告诉你，点击页面也有惊喜。","哼，你刚刚是不是又在偷看我？","要摸头的话……只能一下下哦。","今天也要陪我玩一会儿嘛。"];
const getCurrentLive2dName=()=>{
  const selected=getLive2dModelKey(live2dModelSelect&&live2dModels[live2dModelSelect.value]?live2dModelSelect.value:localStorage.getItem("live2dModel"));
  return live2dModels[selected]?.name||ui("live2dDefaultName");
};
const live2dHoverMessages=["干嘛呢你，快把手拿开～～","鼠…鼠标放错地方了！","你要干嘛呀？","喵喵喵？","怕怕(ノ≧∇≦)ノ","非礼呀！救命！","这样的话，只能使用武力了！","我要生气了哦","不要动手动脚的！","真…真的是不知羞耻！",()=>`${getCurrentLive2dName()}！`,"拿小拳拳锤你胸口！","嗨~快来逗我玩吧！","真……真的是不知羞耻！","再摸的话我可要报警了！","不要摸我了，我要叫我老婆来打你了！","是…是不小心碰到了吧…","干嘛碰我呀，小心我咬你！","哼，再靠近一点试试看？","你、你不要突然凑这么近啦！"];
let clickTexts=["樱花落下的速度，是每秒五厘米。","愿你所到之处，遍地温柔。","今天也辛苦啦。","把热爱写进每一天。","风会带来新的故事。","愿所有长夜都有星光。","保持可爱，也保持锋芒。","世界很大，慢慢相遇。","念念不忘，必有回响。","人终会被年少不可得之物困其一生。","璞玉有缺便是王。","已知乾坤大，犹怜草木青。","追风赶月莫停留，平芜尽处是春山。","光而不耀，静水流深。","日拱一卒，功不唐捐。","沉舟侧畔千帆过，病树前头万木春。","放弃不难，但坚持一定很酷。","向前看，别烂在过去和梦里。","但行好事，莫问前程。","三里清风三里路，步步清风，再无你。"];
let live2dHoverIndex=0,lastLive2dHoverAt=0,live2dHovering=false,live2dHoverExitTimer=null,dialogTimer=null,siteWasHidden=false;live2dReturnMessage=ui("live2dReturnMessage");
const sanitizeWaifuText=(text)=>{
  if(typeof text!=="string")return "";
  const clean=text.trim();
  return /<script|<iframe|javascript:/i.test(clean)?"":clean;
};
const pick=(arr)=>arr[Math.floor(Math.random()*arr.length)];
const showLive2dDialog=(text=pick(live2dMessages))=>{if(!live2dDialog||!live2dEnabled)return;const clean=sanitizeWaifuText(text)||pick(live2dMessages);clearTimeout(dialogTimer);live2dDialog.textContent=clean;live2dDialog.classList.add("visible");dialogTimer=setTimeout(()=>live2dDialog.classList.remove("visible"),2600)};
const showNextLive2dHoverDialog=(force=false)=>{if(!live2dEnabled)return;const now=Date.now();if(!force&&now-lastLive2dHoverAt<350)return;lastLive2dHoverAt=now;const message=live2dHoverMessages[live2dHoverIndex++%live2dHoverMessages.length];showLive2dDialog(typeof message==="function"?message():message)};
let clickTextSeq=0,clickTextForward=true;
const quoteOrderToggle=document.getElementById("quote-order-toggle");
if(quoteOrderToggle){
  quoteOrderToggle.addEventListener("click",()=>{
    clickTextForward=!clickTextForward;
    quoteOrderToggle.textContent=clickTextForward?ui("quoteOrder"):ui("quoteReverse");
  });
}
const showClickText=(x,y,text)=>{
  if(!clickTexts.length)return;
  if(!text){const idx=((clickTextSeq%clickTexts.length)+clickTexts.length)%clickTexts.length;text=clickTexts[idx];clickTextSeq+=clickTextForward?1:-1}
  const clean=sanitizeWaifuText(text);if(!clean)return;
  const el=document.createElement("span");el.className="click-pop-text";el.textContent=clean;
  document.body.appendChild(el);
  // Keep the full bubble inside the viewport, including its upward animation.
  const halfWidth=el.offsetWidth/2;
  el.style.left=`${clamp(x,16+halfWidth,Math.max(16+halfWidth,window.innerWidth-16-halfWidth))}px`;
  el.style.top=`${clamp(y,32,Math.max(32,window.innerHeight-16-el.offsetHeight-6))}px`;
  if(prefersReducedMotion())setTimeout(()=>el.remove(),1000);
  else el.addEventListener("animationend",()=>el.remove(),{once:true});
};
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
  if(!live2dWidget||!live2dCanvas)return false;
  const rect=live2dCanvas.getBoundingClientRect();
  const padX=wide?Math.max(180,rect.width*0.8):Math.max(80,rect.width*0.32);
  const padTop=wide?100:56;
  const padBottom=wide?150:90;
  return event.clientX>=rect.left-padX&&event.clientX<=rect.right+padX&&event.clientY>=rect.top-padTop&&event.clientY<=rect.bottom+padBottom;
};
const applyLive2dSettings=()=>{
  if(!live2dWidget)return;
  const modelKey=getLive2dModelKey(localStorage.getItem("live2dModel"));
  const size=normalizeLive2dSizePercent(localStorage.getItem("live2dSize"));
  const rawX=localStorage.getItem("live2dX"),rawY=localStorage.getItem("live2dY");
  const savedX=Number(rawX),savedY=Number(rawY);
  const hasCustomPosition=localStorage.getItem("live2dCustomPosition")==="true"&&rawX!==null&&rawY!==null&&Number.isFinite(savedX)&&Number.isFinite(savedY);
  live2dWidget.classList.toggle("live2d-custom-position",hasCustomPosition);
  live2dWidget.style.setProperty("--live2d-size",String(size/100));
  if(hasCustomPosition){
    const next=clampLive2dVisualLeftTop(savedX,savedY,size/100);
    const nextX=`${next.x}px`;
    const nextY=`${next.y}px`;
    live2dWidget.style.setProperty("--live2d-x",nextX);
    live2dWidget.style.setProperty("--live2d-y",nextY);
    live2dWidget.style.setProperty("--live2d-bottom","auto");
    live2dWidget.style.left=nextX;
    live2dWidget.style.top=nextY;
    live2dWidget.style.bottom="auto";
    live2dWidget.style.right="auto";
    localStorage.setItem("live2dX",String(next.x));
    localStorage.setItem("live2dY",String(next.y));
  }else{
    const left=`${Math.max(LIVE2D_EDGE_MARGIN,window.innerWidth-getLive2dMetrics(size/100).visualWidth-LIVE2D_EDGE_MARGIN)}px`;
    live2dWidget.style.setProperty("--live2d-x",left);
    live2dWidget.style.setProperty("--live2d-y","auto");
    live2dWidget.style.setProperty("--live2d-bottom",`${LIVE2D_EDGE_MARGIN}px`);
    live2dWidget.style.left=left;
    live2dWidget.style.top="auto";
    live2dWidget.style.right="auto";
    live2dWidget.style.bottom=`${LIVE2D_EDGE_MARGIN}px`;
  }
  localStorage.setItem("live2dSize",String(size));
  if(live2dModelSelect)live2dModelSelect.value=modelKey;
  if(live2dSizeInput)live2dSizeInput.value=String(size);
  if(live2dSizeValue)live2dSizeValue.textContent=`${size}%`;
  positionLive2dChrome();
  scheduleLive2dRelayout();
};
applyLive2dSettings();
let live2dInitStarted=false,live2dInitPromise=null;
const ensureLive2dInitialized=()=>{if(live2dInitStarted)return live2dInitPromise||Promise.resolve();live2dInitStarted=true;live2dInitPromise=initLive2d();return live2dInitPromise};
const refreshLive2dAfterShow=()=>{
  const settle=()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
    settleLive2dChrome({frames:4});
    setLive2dLoading(false);
  }));
  if(!isLive2dVisible())return;
  setLive2dLoading(true);
  if(!live2dInitStarted){
    Promise.resolve(ensureLive2dInitialized()).catch(()=>{}).finally(settle);
    return;
  }
  if(typeof switchLive2dModel==="function"){
    Promise.resolve(switchLive2dModel(getLive2dModelKey(localStorage.getItem("live2dModel"))))
      .catch(()=>{})
      .finally(settle);
    return;
  }
  settle();
};
const initLive2d=async()=>{
  if(!live2dCanvas||!live2dWidget)return;
  if(!window.PIXI||!window.PIXI.live2d||!window.PIXI.live2d.Live2DModel){
    console.warn("Live2D loader is not ready. Check CDN scripts.");
    return;
  }
  try{
    if(!live2dWidget.clientWidth||!live2dWidget.clientHeight)await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    const app=new PIXI.Application({view:live2dCanvas,autoStart:false,transparent:true,backgroundAlpha:0,width:live2dWidget.clientWidth,height:live2dWidget.clientHeight,antialias:true,resolution:Math.min(2,window.devicePixelRatio||1),autoDensity:true,preserveDrawingBuffer:true});
    live2dApp=app;
    let model=null,modelConfig=null,naturalWidth=0,naturalHeight=0,loadToken=0,manualFocusFrame=0,manualFocusPoint={nx:0,ny:0},manualFocusTarget={nx:0,ny:0};
    const setModelParameter=(id,value,coreModel=model?.internalModel?.coreModel)=>{
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
    const setModelPartOpacity=(id,value,coreModel=model?.internalModel?.coreModel)=>{
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
    // Param261 = 1 hides the trial overlay; enforce it at the Cubism draw boundary.
    const watermarkValue=1;
    const applyConfiguredModelMarks=(config,coreModel=model?.internalModel?.coreModel)=>{
      if(!config)return;
      if(config.watermarkParam)setModelParameter(config.watermarkParam,watermarkValue,coreModel);
      (config.hiddenParts||[]).forEach(partId=>setModelPartOpacity(partId,0,coreModel));
    };
    const hideConfiguredModelMarks=()=>applyConfiguredModelMarks(modelConfig);
    const installModelMarkGuard=(target,config)=>{
      const core=target?.internalModel?.coreModel;
      if(!core||core.__markGuardInstalled)return;
      // Motions restore saved parameters inside internalModel.update(). Apply
      // the visibility parameter after that, immediately before Cubism draws.
      const originalUpdate=core.update.bind(core);
      core.update=(...args)=>{
        applyConfiguredModelMarks(config,core);
        if(target===model)applyManualFocus();
        return originalUpdate(...args);
      };
      // Cubism restores its saved parameter buffer after drawing. Keep the
      // externally readable state hidden as well, including paused frames.
      const internal=target.internalModel,updateInternal=internal.update.bind(internal);
      internal.update=(...args)=>{
        const result=updateInternal(...args);
        applyConfiguredModelMarks(config,core);
        if(target===model)applyManualFocus(false,false);
        return result;
      };
      core.__markGuardInstalled=true;
    };
    /*
     * 额外再包一层 render：保证「只重渲染、不重新 update」的路径（看板娘停帧时）
     * 参数值也始终是隐藏态，不会因为别处的写入而漂移成 0。
     */
    const installRenderMarkGuard=()=>{
      if(app.renderer.__markGuardInstalled)return;
      const originalRender=app.renderer.render.bind(app.renderer);
      app.renderer.render=(...args)=>{
        try{
          const core=model?.internalModel?.coreModel;
          const refresh=core&&modelConfig?.watermarkParam&&core.getParameterValueById(modelConfig.watermarkParam)!==watermarkValue;
          hideConfiguredModelMarks();
          // Paused/render-only paths must recalculate drawable pixels as well.
          if(refresh)core.update();
        }catch{}
        return originalRender(...args);
      };
      app.renderer.__markGuardInstalled=true;
    };
    installRenderMarkGuard();
    // Use the character as the horizontal origin, with each side scaled to
    // its available viewport space so distant pointers do not saturate early.
    const live2dFocusRange=(id,fallback)=>{
      const coreModel=model?.internalModel?.coreModel;
      if(!id||!coreModel)return fallback;
      try{
        const index=coreModel.getParameterIndex(id);
        if(index<0||index>=coreModel.getParameterCount())return fallback;
        // 取模型自报的对称量程，避免写超过模型上限（旧代码对 -30..30 的参数写 ±42/±52）
        const limit=Math.min(Math.abs(coreModel.getParameterMinimumValue(index)),Math.abs(coreModel.getParameterMaximumValue(index)));
        return Number.isFinite(limit)&&limit>0?limit:fallback;
      }catch{
        return fallback;
      }
    };
    const setFocusedParameter=(id,nx,fallbackRange)=>{
      if(!id)return;
      const range=live2dFocusRange(id,fallbackRange);
      setModelParameter(id,clamp(nx*range,-range,range));
    };
    const setManualFocusFromEvent=(event)=>{
      const width=window.innerWidth||1,height=window.innerHeight||1;
      const rect=live2dWidget.getBoundingClientRect(),metrics=getLive2dMetrics();
      const centerX=clamp(rect.left+metrics.offsetX+metrics.visualWidth*0.5,1,Math.max(1,width-1));
      const dx=event.clientX-centerX;
      manualFocusTarget={
        nx:clamp(dx/Math.max(1,dx<0?centerX:width-centerX),-1,1),
        ny:clamp((event.clientY/height)*2-1,-1,1)
      };
      // Coalesce paused pointer updates into one real draw per frame.
      if(!app.ticker.started&&!manualFocusFrame){
        manualFocusFrame=requestAnimationFrame(()=>{
          manualFocusFrame=0;
          if(!model||!isLive2dVisible())return;
          applyManualFocus(true);
          model.internalModel.coreModel.update();
          app.renderer.render(app.stage);
        });
      }
    };
    const applyManualFocus=(snap=false,advance=true)=>{
      const focusParams=modelConfig?.focusParams||live2dFocusParams;
      const ease=snap?1:0.18;
      if(advance){
        manualFocusPoint.nx+=(manualFocusTarget.nx-manualFocusPoint.nx)*ease;
        manualFocusPoint.ny+=(manualFocusTarget.ny-manualFocusPoint.ny)*ease;
      }
      const nx=manualFocusPoint.nx,ny=manualFocusPoint.ny;
      setFocusedParameter(focusParams.angleX,nx,30);
      setFocusedParameter(focusParams.angleY,-ny,30);
      setFocusedParameter(focusParams.angleZ,-nx,10);
      setFocusedParameter(focusParams.bodyAngleX,nx,10);
      setFocusedParameter(focusParams.bodyAngleY,-ny,10);
      setFocusedParameter(focusParams.bodyAngleZ,-nx,6);
      setFocusedParameter(focusParams.eyeBallX,nx,1);
      setFocusedParameter(focusParams.eyeBallY,-ny,1);
      setFocusedParameter(focusParams.mouseX,nx,1);
      setFocusedParameter(focusParams.mouseY,-ny,1);
    };
    const updateLive2dDialogAnchor=()=>{
      const w=live2dWidget.clientWidth,h=live2dWidget.clientHeight;
      if(!model||!w||!h)return;
      const metrics=getLive2dMetrics();
      const dialogHalf=Math.min(110,Math.max(72,window.innerWidth*0.26));
      const rect=live2dWidget.getBoundingClientRect();
      const absoluteX=rect.left+metrics.offsetX+metrics.visualWidth*0.5;
      const safeAbsoluteX=clamp(absoluteX,dialogHalf+LIVE2D_EDGE_MARGIN,window.innerWidth-dialogHalf-LIVE2D_EDGE_MARGIN);
      live2dWidget.style.setProperty("--live2d-dialog-x",`${safeAbsoluteX-rect.left}px`);
      const modelHeadY=h*0.98-naturalHeight*model.scale.y;live2dWidget.style.setProperty("--live2d-dialog-y",`${modelHeadY}px`);
      live2dWidget.style.setProperty("--live2d-dialog-shift","-50%");
      positionLive2dChrome({freezePanel:live2dControlsActive});
    };
    const layout=()=>{
      const w=live2dWidget.clientWidth,h=live2dWidget.clientHeight;
      if(!model||!w||!h||!naturalWidth||!naturalHeight)return;
      app.renderer.resolution=Math.min(2,window.devicePixelRatio||1);
      app.renderer.resize(w,h);
      const scale=Math.min(w/naturalWidth,h/naturalHeight)*(modelConfig.scale||0.92);
      model.scale.set(scale,scale);
      model.anchor.set(0.5,1);
      model.position.set(w*0.5,h*0.98);
      updateLive2dDialogAnchor();
      // Resizing clears the canvas; redraw before this frame can be displayed,
      // even when the animation ticker is paused.
      if(isLive2dVisible())app.renderer.render(app.stage);
    };
    live2dRelayout=layout;
    switchLive2dModel=async(modelKey)=>{
      const safeKey=getLive2dModelKey(modelKey);
      if(modelConfig===live2dModels[safeKey]&&model)return;
      const nextConfig=live2dModels[safeKey];
      const token=++loadToken;
      live2dWidget.classList.remove("live2d-hidden");
      try{
        const nextModel=await loadLive2dModel(nextConfig);
        if(token!==loadToken){nextModel.destroy?.();return}
        finishLive2dTransition?.();
        const prevModel=model;
        if(prevModel)prevModel.autoUpdate=false;
        model=nextModel;
        live2dActiveModel=model;
        modelConfig=nextConfig;
        naturalWidth=model.width;
        naturalHeight=model.height;
        hideConfiguredModelMarks();
        installModelMarkGuard(model,nextConfig);
        // Initialize pose/physics before the first draw, including paused mode.
        // Live2DModel.update(0) only queues time; it does not update the model.
        model.internalModel.update(0,model.elapsedTime);
        {
          const w=live2dWidget.clientWidth,h=live2dWidget.clientHeight;
          if(model&&w&&h&&naturalWidth&&naturalHeight){
            app.renderer.resolution=Math.min(2,window.devicePixelRatio||1);
            app.renderer.resize(w,h);
            const s=Math.min(w/naturalWidth,h/naturalHeight)*(modelConfig.scale||0.92);
            model.scale.set(s,s);
            model.anchor.set(0.5,1);
            model.position.set(w*0.5,h*0.98);
          }
        }
        if(prevModel&&isLive2dVisible()&&!prefersReducedMotion()){
          const _fadeOut=prevModel,_fadeIn=model;
          _fadeIn.alpha=0;
          app.stage.addChild(_fadeIn);
          let _elapsed=0;
          const finish=()=>{
            app.ticker.remove(_fadeTick);
            if(_fadeOut.parent)app.stage.removeChild(_fadeOut);
            _fadeOut.destroy?.();
            _fadeIn.alpha=1;
            finishLive2dTransition=null;
          };
          const _fadeTick=()=>{
            _elapsed+=app.ticker.deltaMS;
            const t=Math.min(1,_elapsed/180);
            const ease=t>=1?1:1-Math.pow(2,-10*t);
            _fadeIn.alpha=ease;
            if(t>=1)finish();
          };
          finishLive2dTransition=finish;
          app.ticker.add(_fadeTick);
        }else{
          if(prevModel){app.stage.removeChild(prevModel);prevModel.destroy?.()}
          app.stage.addChild(model);
        }
        layout();
        applyLive2dVisibility();
        syncLive2dRuntime();
        if(live2dModelSelect)live2dModelSelect.value=safeKey;
      }catch(err){
        if(token===loadToken&&!model)live2dWidget.classList.add("live2d-hidden");
        console.warn("Live2D model load failed:",err);
      }
    };
    /*
     * 水印抑制（2026-10-06）
     * Param261 = 1 隐藏水印 / 0 显示水印（已用截图 A/B 实测确认，勿改成 0）。
     * 旧代码注册了 `Ctrl+Shift+任意键` 的全局热键来切换水印 —— 实测这会让
     * Ctrl+Shift+I / C / J（DevTools）等常见快捷键把「试用版」水印永久翻出来，
     * 因此这里彻底移除该热键，水印只由 hideConfiguredModelMarks() 单向压制。
     */
    window.addEventListener("resize",applyLive2dSettings);
    window.addEventListener("pointermove",e=>{
      if(!model||!isLive2dVisible())return;
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
    /*
     * 像素命中测试（2026-10-06 修复）
     * 旧实现：`app.renderer.extract.pixels(app.stage)` 直接按画布尺寸索引。
     * 但 extract.pixels(target) 在没有 frame 时只截取 **target 的包围盒**——
     * 实测返回 258×451（模型包围盒），而画布是 280×560，于是 (y*280+x) 的索引
     * 整体错位，命中判定变成随机值：看板娘既拖不动、点击也没反应。
     * 现在显式传入整块画布的 frame，并按返回缓冲的真实尺寸换算分辨率。
     */
    const hitLive2dPixel=(event)=>{
      const rect=live2dCanvas.getBoundingClientRect();
      if(!rect.width||!rect.height)return false;
      const localX=event.clientX-rect.left;
      const localY=event.clientY-rect.top;
      // 便宜的矩形预判：绝大多数页面点击压根不在看板娘盒子里，不必去抽像素
      if(localX<0||localY<0||localX>=rect.width||localY>=rect.height)return false;
      try{
        const pixels=app.renderer.extract.pixels(app.stage,new PIXI.Rectangle(0,0,rect.width,rect.height));
        const total=pixels.length/4;
        if(!total)return false;
        const scale=Math.sqrt(total/(rect.width*rect.height));
        if(!Number.isFinite(scale)||scale<=0)return false;
        const bufferWidth=Math.round(rect.width*scale);
        const bufferHeight=Math.round(rect.height*scale);
        if(bufferWidth<1||bufferHeight<1)return false;
        const x=Math.min(bufferWidth-1,Math.max(0,Math.floor(localX*scale)));
        const y=Math.min(bufferHeight-1,Math.max(0,Math.floor(localY*scale)));
        return pixels[(y*bufferWidth+x)*4+3]>24;
      }catch{
        // 退化方案：抽像素失败时用模型包围盒做矩形命中，至少保证拖得动
        try{
          const bounds=model?.getBounds?.();
          if(!bounds)return false;
          return localX>=bounds.x&&localX<=bounds.x+bounds.width&&localY>=bounds.y&&localY<=bounds.y+bounds.height;
        }catch{
          return false;
        }
      }
    };
    let live2dDragged=false,draggingLive2d=false,suppressLive2dClick=false,dragOffsetX=0,dragOffsetY=0,dragStartX=0,dragStartY=0,dragStartTarget=null;
    const moveLive2dTo=(x,y,{save=false}={})=>{
      const next=clampLive2dVisualLeftTop(x,y);
      const nextX=next.x;
      const nextY=next.y;
      live2dWidget.classList.add("live2d-custom-position");
      live2dWidget.style.setProperty("--live2d-x",`${nextX}px`);
      live2dWidget.style.setProperty("--live2d-y",`${nextY}px`);
      live2dWidget.style.setProperty("--live2d-bottom","auto");
      live2dWidget.style.left=`${nextX}px`;
      live2dWidget.style.top=`${nextY}px`;
      live2dWidget.style.bottom="auto";
      live2dWidget.style.right="auto";
      if(save){localStorage.setItem("live2dCustomPosition","true");localStorage.setItem("live2dX",String(nextX));localStorage.setItem("live2dY",String(nextY))}
      positionLive2dChrome();
      if(typeof live2dRelayout==="function")live2dRelayout();
    };
    /*
     * 拖拽（2026-10-06 重做）
     * 只用像素命中做拖拽判定是不够的：角色本体只占面板中间一小块
     * （实测 18 个抓取点只有 9 个命中），抓到裙摆外/腿间/空白处就「拖不动」。
     * 现在改为：只要按在**看板娘面板范围内**就能拖；而「点击本体弹语录」仍走
     * 像素精确判定，这样点面板空白处会穿透到页面，不会误弹对话。
     */
    const isInsideLive2dBox=(event)=>{
      const rect=live2dCanvas.getBoundingClientRect();
      if(!rect.width||!rect.height)return false;
      return event.clientX>=rect.left&&event.clientX<=rect.left+rect.width
        &&event.clientY>=rect.top&&event.clientY<=rect.top+rect.height;
    };
    const beginLive2dDrag=(e)=>{
      if(!isLive2dVisible())return;
      if(e.button!==undefined&&e.button!==0)return;
      if(isLive2dSettingsTarget(e.target))return;
      if(!isInsideLive2dBox(e))return;
      const rect=live2dCanvas.getBoundingClientRect();
      draggingLive2d=true;
      live2dDragged=false;
      suppressLive2dClick=false;
      dragStartX=e.clientX;
      dragStartY=e.clientY;
      dragOffsetX=e.clientX-rect.left;
      dragOffsetY=e.clientY-rect.top;
      dragStartTarget=e.target;
      live2dWidget.classList.add("dragging");
      // 这里刻意不 preventDefault：还没确定是「拖」还是「点」，
      // 立刻阻止默认行为会让面板下方的链接/按钮点不动。
    };
    document.addEventListener("pointerdown",beginLive2dDrag);
    const handleLive2dDragMove=(e)=>{
      if(!draggingLive2d)return;
      if(!live2dDragged&&Math.hypot(e.clientX-dragStartX,e.clientY-dragStartY)<=3)return;
      if(!live2dDragged){
        live2dDragged=true;
        try{live2dWidget.setPointerCapture(e.pointerId)}catch{}
        if(e.cancelable)e.preventDefault();
      }
      moveLive2dTo(e.clientX-dragOffsetX,e.clientY-dragOffsetY);
    };
    live2dWidget.addEventListener("pointermove",handleLive2dDragMove);
    document.addEventListener("pointermove",handleLive2dDragMove);
    const endLive2dDrag=()=>{draggingLive2d=false;dragStartTarget=null;live2dWidget.classList.remove("dragging")};
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
    /*
     * 拖完之后的这一次 click 必须吃掉：否则面板下面正好有个链接时，
     * 拖拽结束会顺带触发链接跳转。用捕获阶段的一次性监听器消掉这一下。
     */
    document.addEventListener("click",e=>{
      if(live2dDragged){
        live2dDragged=false;
        e.preventDefault();
        e.stopPropagation();
      }
    },true);
    document.addEventListener("click",e=>{
      if(!isLive2dVisible())return;
      if(isLive2dSettingsTarget(e.target))return;
      if(suppressLive2dClick){suppressLive2dClick=false;live2dDragged=false;return}
      if(!hitLive2dPixel(e))return;
      // Canvas is transparent to pointer events. Capture opaque character hits
      // before the sidebar/link underneath receives the click.
      e.preventDefault();
      e.stopImmediatePropagation();
      // 点本体 → 直接打开设置面板（一次点击就能调到尺寸滑块）。
      // 原来只 showLive2dSettingsButton()，还得再点一次那个 3.6s 后会消失的小把手。
      setLive2dSettingsOpen(true);
      showLive2dDialog();
      if(model?.motion)model.motion("TapBody").catch(()=>{});
    },true);
    await switchLive2dModel(getLive2dModelKey(localStorage.getItem("live2dModel")));
  }catch(err){
    live2dWidget.classList.add("live2d-hidden");
    console.warn("Live2D model load failed:",err);
  }
};
const startLive2d=()=>{applyLive2dSettings();syncLive2dRuntime();if(isLive2dVisible())ensureLive2dInitialized()};
startLive2d();
window.addEventListener("load",startLive2d,{once:true});
window.addEventListener("site-layout-change",startLive2d);
document.addEventListener("visibilitychange",startLive2d);
window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change",syncLive2dRuntime);

document.addEventListener("visibilitychange",()=>{if(document.hidden){siteWasHidden=true;return}if(siteWasHidden){siteWasHidden=false;setTimeout(()=>showLive2dDialog(live2dReturnMessage),260)}});
let lastHashClickAt=0;
const flashSection=(sec,delay=0)=>{if(!sec)return;window.setTimeout(()=>{const isHero=sec.classList.contains("hero");const ringParent=isHero?(sec.querySelector(".hero-inner")||sec):sec;sec.classList.remove("flash-highlight");if(isHero&&ringParent!==sec)ringParent.classList.remove("flash-highlight");ringParent.querySelectorAll(".section-glow-ring").forEach(ring=>ring.remove());sec.querySelectorAll(".section-glow-ring").forEach(ring=>ring.remove());void sec.offsetWidth;const ring=document.createElement("span");ring.className="section-glow-ring";ring.setAttribute("aria-hidden","true");ringParent.appendChild(ring);sec.classList.add("flash-highlight");if(isHero&&ringParent!==sec)ringParent.classList.add("flash-highlight");window.clearTimeout(sec._flashHighlightTimer);sec._flashHighlightTimer=window.setTimeout(()=>{sec.classList.remove("flash-highlight");if(isHero&&ringParent!==sec)ringParent.classList.remove("flash-highlight");ring.remove()},3200)},delay)};
const getHashSection=()=>{const id=window.location.hash?decodeURIComponent(window.location.hash.slice(1)):"";return id?document.getElementById(id):null};
hashActionLinks.forEach(a=>a.addEventListener("click",()=>{const id=a.getAttribute("href"),sec=id&&id.startsWith("#")?document.getElementById(id.slice(1)):null;if(!sec)return;lastHashClickAt=Date.now();flashSection(sec,240)}));
window.addEventListener("hashchange",()=>{if(Date.now()-lastHashClickAt<800)return;flashSection(getHashSection(),240)});
if(document.readyState==="complete")flashSection(getHashSection(),320);else window.addEventListener("load",()=>flashSection(getHashSection(),320));
document.addEventListener("click",e=>{if(e.target?.closest?.("a,button,input,select,label,summary,.quick-jump,.live2d-widget,.card,.anime-viewer,.music-library-player,.side-nav"))return;showClickText(e.clientX,e.clientY)});

document.querySelectorAll("[data-char-slide]").forEach(el=>{const text=el.textContent||"";el.textContent="";[...text].forEach((char,i)=>{const span=document.createElement("span");span.className="char-slide";span.style.animationDelay=i*0.028+"s";span.textContent=char===" "?" ":char;el.appendChild(span)})});

/* ==== Tech collapse — high-tech expand/collapse animation ==== */
(function() {
  const TECH_PANELS = '.about-panel, .about-sub-panel, .music-library-details';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animateCollapse = (details, open) => {
    const inner = details.querySelector(':scope > .panel-inner');
    if (!inner) return;
    details.dataset.targetOpen = String(open);
    if (reducedMotion) {
      details.open = open;
      return;
    }
    const start = details.open ? inner.getBoundingClientRect().height : 0;
    details._panelAnimation?.cancel();
    details.open = true;
    inner.style.maxHeight = 'none';
    inner.style.transition = 'none';
    inner.style.height = `${start}px`;
    const end = open ? inner.scrollHeight : 0;
    details.classList.toggle('tech-expanding', open);
    details.classList.toggle('tech-collapsing', !open);
    if (open) spawnTechParticles(details);
    const animation = inner.animate([{ height: `${start}px` }, { height: `${end}px` }], {
      duration: 300,
      easing: 'cubic-bezier(.22, 1, .36, 1)'
    });
    details._panelAnimation = animation;
    animation.onfinish = () => {
      if (details._panelAnimation !== animation) return;
      details.open = open;
      inner.style.removeProperty('height');
      inner.style.removeProperty('max-height');
      inner.style.removeProperty('transition');
      details.classList.remove('tech-expanding', 'tech-collapsing');
      delete details._panelAnimation;
      delete details.dataset.targetOpen;
    };
  };

  // Spawn tiny glowing particles near the panel on expand
  const spawnTechParticles = (el) => {
    const rect = el.getBoundingClientRect();
    const count = 8;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('span');
      particle.className = 'tech-particle';
      particle.style.left = (10 + Math.random() * 80) + '%';
      particle.style.top = (20 + Math.random() * 60) + '%';
      particle.style.animationDelay = (i * 0.04) + 's';
      el.appendChild(particle);
      particle.addEventListener('animationend', () => particle.remove());
    }
  };

  // Delegate summary clicks on tech panels
  const init = () => {
    document.addEventListener('click', function(e) {
      // e.target 不一定是 Element（例如事件在 document 上派发），必须防护
      const summary = e.target?.closest?.('summary');
      if (!summary) return;

      const details = summary.closest(TECH_PANELS);
      if (!details) return;

      // Only handle if it has a .panel-inner (our wrapped ones)
      if (!details.querySelector(':scope > .panel-inner')) return;

      e.preventDefault();

      animateCollapse(details, details.dataset.targetOpen === undefined ? !details.open : details.dataset.targetOpen !== 'true');
    });

    // Handle keyboard activation (Enter/Space on summary)
    document.addEventListener('keydown', function(e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const summary = e.target?.closest?.('summary');
      if (!summary) return;
      const details = summary.closest(TECH_PANELS);
      if (!details || !details.querySelector(':scope > .panel-inner')) return;
      e.preventDefault();
      animateCollapse(details, details.dataset.targetOpen === undefined ? !details.open : details.dataset.targetOpen !== 'true');
    });

    // Initialize: pre-opened panels need height:auto so they're visible from the start.
    // Closed panels don't need an inline height — the browser hides their content natively,
    // and CSS max-height:0 handles the transition starting point when they open.
    document.querySelectorAll(TECH_PANELS).forEach(function(details) {
      const inner = details.querySelector(':scope > .panel-inner');
      if (!inner) return;
      if (details.open) {
        inner.style.height = 'auto';
      }
      // closed panels: do NOT set height:0px — it would block the open animation
    });
  };

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
/* ==== Particle network background ==== */
(function() {
  var container = document.getElementById('particle-canvas');
  if (!container || !window.ParticleNetwork) return;

  var widthInput = document.getElementById('particle-line-width');
  var widthValue = document.getElementById('particle-line-width-value');
  var motionToggle = document.getElementById('particle-motion-toggle');
  var motionLabel = document.querySelector('.particle-motion-switch span');
  /*
   * 粒子运动默认开启（2026-10-06）
   * 旧默认是 `!== 'false' && !prefersReducedMotion()`：系统开了「减少动画」、
   * 或者以前点过一次「暂停」，粒子就会一直冻着，看起来像特效坏了。
   * 现在默认一律开启，只有用户在本机显式点过「暂停」才关闭；
   * 旧版本可能因为系统偏好被写成 false，用版本号做一次性迁移。
   */
  var PARTICLE_MOTION_VERSION = '2';
  var storedMotion = localStorage.getItem('particleMotionEnabled');
  var storedMotionVersion = localStorage.getItem('particleMotionVersion');
  var motionEnabled = storedMotionVersion === PARTICLE_MOTION_VERSION ? storedMotion !== 'false' : true;
  localStorage.setItem('particleMotionVersion', PARTICLE_MOTION_VERSION);
  localStorage.setItem('particleMotionEnabled', String(motionEnabled));
  var savedWidth = parseFloat(localStorage.getItem('particleLineWidth'));
  var lineWidth = Number.isFinite(savedWidth) && savedWidth >= .8 && savedWidth <= 3.2 ? Math.round(savedWidth * 5) / 5 : 1.6;
  if (widthInput) widthInput.value = String(lineWidth);
  if (widthValue) widthValue.textContent = `${lineWidth.toFixed(1)}px`;

  var options = {
    particleColor: '#888',
    background: 'assets/particle-bg.jpg',
    // 上游 canvas-particle-network 的 interactive 会把光标做成一个 velocity=0 的
    // 「鼠标粒子」放进粒子数组，于是 120px 内的粒子自然连到光标 —— 这正是原版
    // demo 的行为，之前被显式关掉了（所以没有光标连线）。
    interactive: true,
    speed: motionEnabled ? 'fast' : 'none',
    density: 20000,
    lineWidth: lineWidth,
    particleRadius: lineWidth + .5
  };

  var network = new ParticleNetwork(container, options);
  /*
   * 库自带的监听挂在 canvas 上，而 #particle-canvas{pointer-events:none} 是为了
   * 让粒子层不挡住页面点击，所以那些监听永远不会触发。这里改在 window 上驱动
   * 同一个鼠标锚点粒子（network.p），既保留点击穿透，又能连到光标。
   */
  var mouseAnchor = network.p || null;
  var parkMouseAnchor = function() {
    if (!mouseAnchor) return;
    mouseAnchor.x = -9999;
    mouseAnchor.y = -9999;
  };
  var moveMouseAnchor = function(event) {
    if (!mouseAnchor) return;
    var canvas = container.querySelector('canvas');
    if (!canvas) return;
    var rect = canvas.getBoundingClientRect();
    mouseAnchor.x = event.clientX - rect.left;
    mouseAnchor.y = event.clientY - rect.top;
  };
  parkMouseAnchor();
  window.addEventListener('pointermove', moveMouseAnchor, { passive: true });
  window.addEventListener('pointerdown', moveMouseAnchor, { passive: true });
  document.addEventListener('pointerleave', parkMouseAnchor);
  window.addEventListener('blur', parkMouseAnchor);
  var heroVisible = true;
  var syncParticleRuntime = function() {
    var running = motionEnabled && heroVisible && !document.hidden;
    network.stop();
    network.options.velocity = running ? network.setVelocity('fast') : 0;
    network.o.forEach(function(particle) {
      // 鼠标锚点必须保持静止，否则它会被推离光标、连线跟着飘走
      if (particle === mouseAnchor) return;
      particle.velocity.x = running ? (Math.random() - .5) * network.options.velocity : 0;
      particle.velocity.y = running ? (Math.random() - .5) * network.options.velocity : 0;
    });
    container.style.visibility = heroVisible ? 'visible' : 'hidden';
    if (running) network.start();
    else if (heroVisible && !document.hidden) network.update();
  };
  var heroObserver = new IntersectionObserver(function(entries) {
    heroVisible = entries[0].isIntersecting;
    syncParticleRuntime();
  });
  heroObserver.observe(document.getElementById('hero'));
  document.addEventListener('visibilitychange', syncParticleRuntime);
  // The library rebuilds particles 500ms after a resize; reapply the paused state.
  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(syncParticleRuntime, 550);
  });
  var syncMotionUI = function() {
    var english = currentLanguage === 'en';
    if (motionLabel) motionLabel.textContent = english ? 'Particle motion' : '粒子运动';
    if (!motionToggle) return;
    var action = motionEnabled ? (english ? 'Pause' : '暂停') : (english ? 'Play' : '播放');
    motionToggle.textContent = action;
    motionToggle.classList.toggle('active', motionEnabled);
    motionToggle.setAttribute('aria-pressed', String(motionEnabled));
    motionToggle.setAttribute('aria-label', `${action} ${english ? 'particle motion' : '粒子运动'}`);
  };
  syncMotionUI();
  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", function(event) {
    if(event.matches){motionEnabled=false;syncMotionUI();syncParticleRuntime()}
  });
  languageToggle?.addEventListener('click', syncMotionUI);
  motionToggle?.addEventListener('click', function() {
    motionEnabled = !motionEnabled;
    syncParticleRuntime();
    localStorage.setItem('particleMotionEnabled', String(motionEnabled));
    syncMotionUI();
  });
  widthInput?.addEventListener('input', function() {
    var width = Number(widthInput.value);
    network.options.lineWidth = width;
    network.options.particleRadius = width + .5;
    if (widthValue) widthValue.textContent = `${width.toFixed(1)}px`;
    localStorage.setItem('particleLineWidth', widthInput.value);
    syncParticleRuntime();
  });

  // Library sets container to position:relative, restore to fixed
  container.style.position = 'fixed';
  container.style.inset = '0';
  // 测试/调试挂钩：粒子模块是 IIFE，外部无法自查「光标连线」是否真的开着
  window.__particleNetwork = {
    interactive: options.interactive === true,
    mouseAnchor: mouseAnchor,
    network: network
  };
})();
