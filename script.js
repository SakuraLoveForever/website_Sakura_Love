document.documentElement.classList.add("js");
const $=(s)=>document.querySelector(s);
const yearSpan=$("#year"),styleSelect=$("#style-select"),languageToggle=$("#language-toggle"),sidebarToggle=$("#sidebar-toggle"),sidebarAvatarButton=$("#sidebar-avatar-button"),sidebarAvatarInput=$("#sidebar-avatar-input"),sidebarLogoMark=$(".sidebar-logo-mark"),sidebarLinks=document.querySelectorAll(".sidebar-link"),designStyleButtons=document.querySelectorAll(".design-style-btn"),layoutModeButtons=document.querySelectorAll(".view-mode-btn"),bgToggle=$("#bg-toggle"),bgCharacterSelect=$("#bg-character-select"),bgPlayModeSelect=$("#bg-play-mode"),musicToggle=$("#music-toggle"),musicVolumeInput=$("#music-volume"),musicSeekInput=$("#music-seek"),musicTimeDisplay=$("#music-time-display"),headerMusicNextButton=$("#header-music-next"),headerImageNextButton=$("#header-image-next"),pageMuteToggleButton=$("#page-mute-toggle"),muteProgressArc=$("#mute-progress-arc"),animeViewer=$(".anime-viewer"),bgLayerA=$("#bg-layer-a"),bgLayerB=$("#bg-layer-b"),live2dModelSelect=$("#live2d-model"),live2dSizeInput=$("#live2d-size"),live2dSizeValue=$("#live2d-size-value"),live2dSettingsToggle=$("#live2d-settings-toggle"),live2dSettingsPanel=$("#live2d-settings-panel"),hashActionLinks=document.querySelectorAll(".hero-actions a[href^='#'],.sidebar-link[href^='#']"),toastRoot=$("#toast-root");
const styleMap={apple:"design-apple",linear:"design-linear",spotify:"design-spotify",figma:"design-figma",notion:"design-notion"};
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
const getLive2dModelKey=(key)=>live2dModels[key]?key:live2dDefaultModel;
const live2dCdnUrl=(path)=>live2dCdnBase+path.split("/").map(encodeURIComponent).join("/");
const live2dModelSources=(config)=>[config.path,live2dCdnUrl(config.path)];
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
let bgPlayMode=localStorage.getItem("bgPlayMode")||"single",activeBgLayer=bgLayerA,bgTimer=null,currentRole=localStorage.getItem("bgCharacter")||"02",isPagePaused=true,musicEnabled=localStorage.getItem("musicEnabled")!=="false",_suppressSelectChange=false;
const bgSeq={},musicSeq={},player=new Audio();
player.loop=false;player.preload="auto";player.volume=Math.min(1,Math.max(0,Number(localStorage.getItem("musicVolume"))||0.6));player.muted=false;localStorage.removeItem("pageMuted");
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
const detectLayoutMode=()=>/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent)||window.matchMedia?.("(pointer: coarse)")?.matches&&window.innerWidth<=920||window.innerWidth<=700?"mobile":"desktop";
const applyStyle=(k)=>{const safe=styleMap[k]?k:"apple";document.body.classList.remove(...Object.values(styleMap),...legacyStyleClasses);document.body.classList.add(styleMap[safe]);document.body.classList.toggle("theme-dark",safe==="apple");designStyleButtons.forEach(button=>{const active=button.dataset.designStyle===safe;button.classList.toggle("active",active);button.setAttribute("aria-pressed",String(active))});if(styleSelect)styleSelect.value=safe;localStorage.setItem("stylePreset",safe);localStorage.removeItem("themeMode")};
const applyLayoutMode=(mode)=>{const safe=mode==="mobile"?"mobile":"desktop";document.body.classList.toggle("layout-mobile",safe==="mobile");layoutModeButtons.forEach(button=>{const active=button.dataset.layoutMode===safe;button.classList.toggle("active",active);button.setAttribute("aria-pressed",String(active))});localStorage.setItem("layoutMode",safe)};
const setBg=(role)=>{if(!bgLayerA||!bgLayerB)return;const r=bgFiles[role]?.length?role:"02",files=bgFiles[r],idx=(bgSeq[r]||0)%files.length;bgSeq[r]=(bgSeq[r]||0)+1;currentRole=r;_suppressSelectChange=true;if(bgCharacterSelect)bgCharacterSelect.value=r;localStorage.setItem("bgCharacter",r);const next=activeBgLayer===bgLayerA?bgLayerB:bgLayerA;next.style.backgroundImage=`url("assets/backgrounds/${r}/${files[idx]}")`;next.classList.add("visible");if(activeBgLayer)activeBgLayer.classList.remove("visible");activeBgLayer=next};
const nextRole=()=>{const start=bgRoleOrder.indexOf(currentRole);return bgRoleOrder[(start+1+bgRoleOrder.length)%bgRoleOrder.length]||"02"};
const nextSceneRole=(role=currentRole)=>bgPlayMode==="all"?nextRole():(bgCount[role]?role:"02");
let _durationCheckTimer=0;const ensureDuration=()=>{clearTimeout(_durationCheckTimer);if(!Number.isFinite(player.duration)||player.duration<=0){_durationCheckTimer=setTimeout(()=>{if(!Number.isFinite(player.duration)||player.duration<=0){const saved=player.currentTime;const onSeeked=()=>{player.removeEventListener("seeked",onSeeked);if(Number.isFinite(player.duration)&&player.duration>0){player.currentTime=Math.min(saved,player.duration||0);progress()}};player.addEventListener("seeked",onSeeked);player.currentTime=1e8}},1200)}};const playRole=(role)=>{if(!musicEnabled)return;const r=musicCount[role]?role:"02",count=musicCount[r],idx=((musicSeq[r]||0)%count)+1;musicSeq[r]=(musicSeq[r]||0)+1;player.src=`assets/music/${r}/${idx}.mp3`;if(musicSeekInput){musicSeekInput.value="0";musicSeekInput.max="100";musicSeekInput.style.setProperty("--seek","0%")}if(muteProgressArc)muteProgressArc.style.strokeDashoffset="100";progress();if(!isPagePaused)player.play().then(startMusicProgressLoop).catch(()=>{});ensureDuration()};
const showScene=(role,{withMusic=false}={})=>{const r=bgCount[role]?role:"02";setBg(r);if(withMusic)playRole(r)};
const scheduleBgOnly=()=>{clearInterval(bgTimer);if(!musicEnabled)bgTimer=setInterval(()=>showScene(nextSceneRole()),3000)};
const applyBg=(on,role)=>{clearInterval(bgTimer);if(animeViewer)animeViewer.classList.toggle("is-viewer-off",!on);if(!bgLayerA||!bgLayerB)return;if(!on){player.pause();bgLayerA.classList.remove("visible");bgLayerB.classList.remove("visible");bgLayerA.style.backgroundImage="";bgLayerB.style.backgroundImage="";return}showScene(role,{withMusic:musicEnabled});scheduleBgOnly()};
const playNext=()=>{if(!isViewerEnabled())return;const role=nextSceneRole(bgCharacterSelect?bgCharacterSelect.value:"02");showScene(role,{withMusic:musicEnabled})};const nextImageOnly=()=>{if(!isViewerEnabled())return;const role=bgCharacterSelect?bgCharacterSelect.value:currentRole;setBg(bgCount[role]?role:"02")};
const updateMusicButtonState=()=>{if(!pageMuteToggleButton)return;const active=Boolean(player.src)&&!player.paused&&!isPagePaused;const label=currentLanguage==="en"?(isPagePaused?"Resume music":"Pause music"):(isPagePaused?"继续播放":"暂停播放");pageMuteToggleButton.classList.toggle("is-playing",active);pageMuteToggleButton.classList.toggle("muted",isPagePaused);pageMuteToggleButton.setAttribute("aria-pressed",String(isPagePaused));pageMuteToggleButton.setAttribute("aria-label",label);pageMuteToggleButton.title=label};
let musicProgressTimer=0;
let _musicSeekDragging=false;
const fmtTime=(s)=>{if(!Number.isFinite(s)||s<0)s=0;const m=Math.floor(s/60),sec=Math.floor(s%60);return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`};const drawMusicProgress=()=>{if(_musicSeekDragging)return;const d=player.duration,t=player.currentTime;if(musicTimeDisplay)musicTimeDisplay.textContent=`${fmtTime(t)} / ${Number.isFinite(d)&&d>0?fmtTime(d):"0:00"}`;if(muteProgressArc){if(Number.isFinite(d)&&d>0)muteProgressArc.style.strokeDashoffset=String(100-(t/d*100))}if(!musicSeekInput)return;if(Number.isFinite(d)&&d>0){musicSeekInput.max=String(d);musicSeekInput.value=String(t);musicSeekInput.style.setProperty("--seek",(t/d*100)+"%")}};
const progress=()=>{drawMusicProgress();updateMusicButtonState()};
const stopMusicProgressLoop=()=>{if(musicProgressTimer)clearInterval(musicProgressTimer);musicProgressTimer=0;progress()};
const startMusicProgressLoop=()=>{if(musicProgressTimer)return;progress();musicProgressTimer=setInterval(progress,120)};
const controls=()=>updateMusicButtonState();
const playModeUI=()=>{if(bgCharacterSelect)bgCharacterSelect.disabled=bgPlayMode!=="single";if(headerMusicNextButton)headerMusicNextButton.title=bgPlayMode==="single"?ui("nextSong"):ui("nextRole")};
let currentLanguage=localStorage.getItem("languageMode")==="en"?"en":"zh";
const languageCopy={
  zh:{
    pageTitle:"Sakura_Love | 个人主页",pageDescription:"一个简洁、响应式的个人网页模板，展示个人介绍、技能、项目与联系方式。",languageLabel:"切换语言",personalGallery:"个人画廊",intro:"把竞赛、工程、阅读与一点点二次元热爱，收束成一个安静的个人主页。",viewProjects:"查看项目",contactMe:"联系我",characterWindow:"角色窗口",characterViewer:"角色欣赏",muteToggle:"角色音乐静音开关",viewerStage:"角色图片展示窗口",viewerEmpty:"打开欣赏窗口后，这里会展示角色图片。",viewerSettings:"角色欣赏设置",character:"角色",chooseCharacter:"选择背景角色",playMode:"播放模式",playModeLabel:"背景播放模式",singleRole:"单角色",allRoles:"全角色",music:"音乐",enabled:"开启",volume:"音量",volumeLabel:"调节角色音乐音量",nextSong:"切歌",nextImage:"换图",nextRole:"切角色",imageChanged:"图片已切换",aboutNav:"关于",skillsNav:"技能",projectsNav:"项目",contactNav:"联系",aboutTitle:"关于我",education:"学习经历",awards:"获奖经历",machinery:"机械类",mathematics:"数学类",programming:"计算机程序设计类",primary:"小学",junior:"初中",senior:"高中",bachelor:"本科",master:"硕士",primaryValue:"泉州市安溪县实验小学",juniorValue:"福州市金山中学",seniorValue:"福建省福州第一中学",bachelorValue:"福州大学（机械工程及自动化）",masterValue:"厦门大学（计算机科学与技术）",awardKey:"奖项",mechAward:"第一届普通高等学校本科生机械设计基础类课程实践作品竞赛（整机机构类、设计验证类）全国二等奖。",mathAward:"2024年全国大学生数学竞赛非数学A类福建省一等奖。",icpc2024:"第49届 ICPC 国际大学生程序设计竞赛区域赛上海站铜牌。",ccpc2025:"2025年中国大学生程序设计竞赛 CCPC 福建省邀请赛银奖。",gplt:"2024、2025 年团体程序设计天梯赛 GPLT 全国个人三等奖。",baiduStar:"2025年百度之星程序设计大赛省赛银奖。",lanqiao:"2025年蓝桥杯 C++ A 组福建省一等奖，全国个人三等奖。",skillsTitle:"技能",projectsTitle:"项目",projectLifeTitle:"卷里山河，心头月色",projectLifeAria:"查看卷里山河，心头月色",projectLifeDesc:"阅读与长夜随笔，支持目录导航与夜间模式，适合沉浸式阅读与记录灵感。",projectQuotesTitle:"心灵鸡汤 - 互动语录",projectQuotesAria:"查看心灵鸡汤 - 互动语录",projectQuotesDesc:"可交互的语录归档网站，支持分类展开收起和目录快速跳转浏览。",projectKindleTitle:"Kindle笔记导出工具",projectKindleAria:"查看 Kindle 笔记导出工具",projectKindleDesc:"免费在线工具，支持上传 My Clippings.txt 并本地处理导出，保护隐私。",projectYoutubeTitle:"YouTube取消点赞脚本",projectYoutubeAria:"查看 YouTube 取消点赞脚本",projectYoutubeDesc:"浏览器控制台与 Tampermonkey 脚本，批量取消曾经在 YouTube 点赞过的视频，适合清理账号历史记录。",contactTitle:"联系我",contactHtml:'邮箱：<a href="mailto:jackjack1272@163.com">jackjack1272@163.com</a> | GitHub：<a href="https://github.com/SakuraLoveForever" target="_blank" rel="noreferrer">SakuraLoveForever</a>',live2dOpen:"展开看板娘设置",live2dSettings:"看板娘设置",live2dModel:"看板娘角色",chooseLive2dModel:"选择看板娘角色",live2dSize:"看板娘大小",adjustLive2dSize:"调节看板娘大小",top:"顶部",topAria:"回到顶部",bottom:"底部",bottomAria:"跳到底部",style:"风格",styleAria:"切换网页风格",styleGroup:"选择 Apple、Linear、Spotify、Figma 或 Notion 风格",view:"视图",viewAria:"切换网页布局",viewGroup:"选择网页端或移动端布局",desktop:"网页端",mobile:"移动端",xhs:"小红书",xhsHome:"小红书主页",githubHome:"GitHub主页",bilibiliHome:"Bilibili主页",styleUpdated:"风格已更新",languageUpdated:"语言已切换",darkOn:"夜间模式已开启",darkOff:"夜间模式已关闭",mobileLayout:"已切换移动端布局",desktopLayout:"已切换网页端布局",bgRoleChanged:"欣赏角色已切换",playModeUpdated:"播放模式已更新",musicOn:"音乐已开启",musicOff:"音乐已关闭",live2dModelChanged:"看板娘角色已切换",songChanged:"歌曲已切换",roleChanged:"角色已切换",muted:"已静音",unmuted:"已取消静音",mute:"静音",unmute:"取消静音"
  },
  en:{
    pageTitle:"Sakura_Love | Personal Site",pageDescription:"A clean, responsive personal website for profile, skills, projects, and contact links.",languageLabel:"Switch language",personalGallery:"Personal Gallery",intro:"A quiet personal homepage for competitions, engineering, reading, and a little anime-inspired warmth.",viewProjects:"View Projects",contactMe:"Contact Me",characterWindow:"Character Window",characterViewer:"Character Viewer",muteToggle:"Toggle character music mute",viewerStage:"Character image display window",viewerEmpty:"Open the viewer and character images will appear here.",viewerSettings:"Character viewer settings",character:"Character",chooseCharacter:"Choose background character",playMode:"Playback Mode",playModeLabel:"Background playback mode",singleRole:"Single Character",allRoles:"All Characters",music:"Music",enabled:"Enabled",volume:"Volume",volumeLabel:"Adjust character music volume",nextSong:"Next song",nextImage:"Next image",nextRole:"Next character",imageChanged:"Image changed",aboutNav:"About",skillsNav:"Skills",projectsNav:"Projects",contactNav:"Contact",aboutTitle:"About Me",education:"Education",awards:"Awards",machinery:"Mechanical Design",mathematics:"Mathematics",programming:"Programming",primary:"Primary School",junior:"Junior High",senior:"Senior High",bachelor:"Bachelor",master:"Master",primaryValue:"Anxi Experimental Primary School, Quanzhou",juniorValue:"Jinshan Middle School, Fuzhou",seniorValue:"Fuzhou No.1 High School, Fujian",bachelorValue:"Fuzhou University (Mechanical Engineering and Automation)",masterValue:"Xiamen University (Computer Science and Technology)",awardKey:"Award",mechAward:"National Second Prize in the first undergraduate mechanical design fundamentals practice competition.",mathAward:"First Prize, Fujian Province, 2024 National College Student Mathematics Competition, Non-Math A group.",icpc2024:"Bronze Medal, ICPC 2024 Shanghai Regional Contest.",ccpc2025:"Silver Medal, CCPC 2025 Fujian Invitational Contest.",gplt:"National Individual Third Prize, GPLT Team Programming Contest in 2024 and 2025.",baiduStar:"Provincial Silver Medal, Baidu Star Programming Contest 2025.",lanqiao:"First Prize in Fujian Province and National Individual Third Prize, Lanqiao Cup 2025 C++ A group.",skillsTitle:"Skills",projectsTitle:"Projects",projectLifeTitle:"Mountains in Pages, Moonlight in Mind",projectLifeAria:"View Mountains in Pages, Moonlight in Mind",projectLifeDesc:"A reading and late-night essay site with table-of-contents navigation and dark mode for immersive notes and inspiration.",projectQuotesTitle:"Soul Quotes Archive",projectQuotesAria:"View Soul Quotes Archive",projectQuotesDesc:"An interactive quote archive with collapsible categories and fast table-of-contents navigation.",projectKindleTitle:"Kindle Notes Exporter",projectKindleAria:"View Kindle Notes Exporter",projectKindleDesc:"A free online tool that locally processes uploaded My Clippings.txt files and exports notes while protecting privacy.",projectYoutubeTitle:"YouTube Unlike Helper",projectYoutubeAria:"View YouTube Unlike Helper",projectYoutubeDesc:"A browser console and Tampermonkey script for batch unliking previously liked YouTube videos.",contactTitle:"Contact",contactHtml:'Email: <a href="mailto:jackjack1272@163.com">jackjack1272@163.com</a> | GitHub: <a href="https://github.com/SakuraLoveForever" target="_blank" rel="noreferrer">SakuraLoveForever</a>',live2dOpen:"Open Live2D settings",live2dSettings:"Live2D settings",live2dModel:"Live2D Model",chooseLive2dModel:"Choose Live2D model",live2dSize:"Live2D Size",adjustLive2dSize:"Adjust Live2D size",top:"Top",topAria:"Back to top",bottom:"Bottom",bottomAria:"Jump to bottom",style:"Style",styleAria:"Switch website style",styleGroup:"Choose Apple, Linear, Spotify, Figma, or Notion style",view:"View",viewAria:"Switch website layout",viewGroup:"Choose desktop or mobile layout",desktop:"Desktop",mobile:"Mobile",xhs:"Xiaohongshu",xhsHome:"Xiaohongshu profile",githubHome:"GitHub profile",bilibiliHome:"Bilibili profile",styleUpdated:"Style updated",languageUpdated:"Language switched",darkOn:"Dark mode enabled",darkOff:"Dark mode disabled",mobileLayout:"Switched to mobile layout",desktopLayout:"Switched to desktop layout",bgRoleChanged:"Character changed",playModeUpdated:"Playback mode updated",musicOn:"Music enabled",musicOff:"Music disabled",live2dModelChanged:"Live2D model changed",songChanged:"Song changed",roleChanged:"Character changed",muted:"Muted",unmuted:"Unmuted",mute:"Mute",unmute:"Unmute"
  }
};
const ui=(key)=>languageCopy[currentLanguage]?.[key]||languageCopy.zh[key]||key;
const setText=(selector,text)=>{const el=$(selector);if(el)el.textContent=text};
const setHtml=(selector,html)=>{const el=$(selector);if(el)el.innerHTML=html};
const setAttr=(selector,attr,value)=>{const el=$(selector);if(el)el.setAttribute(attr,value)};
const applyLanguage=(mode)=>{
  const safe=mode==="en"?"en":"zh",copy=languageCopy[mode==="en"?"en":"zh"];
  currentLanguage=safe;document.documentElement.lang=safe==="en"?"en":"zh-CN";document.title=copy.pageTitle;
  const meta=document.querySelector('meta[name="description"]');if(meta)meta.setAttribute("content",copy.pageDescription);
  if(languageToggle){languageToggle.setAttribute("aria-label",copy.languageLabel);languageToggle.setAttribute("title",copy.languageLabel);const text=languageToggle.querySelector(".language-text");if(text)text.textContent=safe==="en"?"中":"EN"}
  setText(".hero-copy .eyebrow",copy.personalGallery);setText(".hero-copy .intro",copy.intro);setText(".hero-actions .btn.primary",copy.viewProjects);setText(".hero-actions .btn.secondary",copy.contactMe);
  setText(".anime-viewer-head .eyebrow",copy.characterWindow);setText("#anime-viewer-title",copy.characterViewer);setAttr("#page-mute-toggle","aria-label",copy.muteToggle);setAttr(".anime-viewer-stage","aria-label",copy.viewerStage);setText(".anime-viewer-empty",copy.viewerEmpty);setAttr(".anime-viewer-settings","aria-label",copy.viewerSettings);
  setText("#bg-character-wrap .control-title",copy.character);setAttr("#bg-character-select","aria-label",copy.chooseCharacter);setText(".anime-viewer-settings .control-group:nth-of-type(2) .control-title",copy.playMode);setAttr("#bg-play-mode","aria-label",copy.playModeLabel);setText('#bg-play-mode option[value="single"]',copy.singleRole);setText('#bg-play-mode option[value="all"]',copy.allRoles);setText(".anime-viewer-settings .control-group:nth-of-type(3) .control-title",copy.music);setText(".check-row span",copy.enabled);setAttr("#music-toggle","aria-label",copy.music);setAttr("#music-volume","aria-label",copy.volumeLabel);setAttr("#music-volume","title",copy.volume);setAttr("#header-music-next","aria-label",copy.nextSong);setAttr("#header-image-next","aria-label",copy.nextImage);setAttr("#header-image-next","title",copy.nextImage);
  const sidebarText=safe==="en"?{home:"Home",about:"About Me",skills:"Skills",projects:"Projects",contact:"Contact",settings:"Page Settings",mode:"Theme",collapse:"Collapse sidebar",expand:"Expand sidebar",avatar:"Upload custom avatar"}:{home:"首页",about:"关于我",skills:"技能",projects:"项目",contact:"联系",settings:"页面设置",mode:"模式切换",collapse:"收缩侧边栏",expand:"展开侧边栏",avatar:"上传自定义头像"};
  Object.entries(sidebarText).forEach(([key,text])=>{if(!["mode","collapse","expand","avatar"].includes(key))setText(`.sidebar-link[data-nav-key="${key}"] .sidebar-label`,text)});
  if(sidebarToggle)sidebarToggle.setAttribute("aria-label",document.body.classList.contains("sidebar-collapsed")?sidebarText.expand:sidebarText.collapse);if(sidebarAvatarButton){sidebarAvatarButton.setAttribute("aria-label",sidebarText.avatar);sidebarAvatarButton.setAttribute("title",sidebarText.avatar)}
  setText("#about > h2",copy.aboutTitle);setText("#about > details:nth-of-type(1) > summary",copy.education);setText("#about > details:nth-of-type(2) > summary",copy.awards);setText(".about-sub-panel:nth-of-type(1) > summary",copy.machinery);setText(".about-sub-panel:nth-of-type(2) > summary",copy.mathematics);setText(".about-sub-panel:nth-of-type(3) > summary",copy.programming);
  const aboutKeys=document.querySelectorAll("#about > details:nth-of-type(1) .about-key");[copy.primary,copy.junior,copy.senior,copy.bachelor,copy.master].forEach((text,index)=>{if(aboutKeys[index])aboutKeys[index].textContent=text});
  const aboutValues=document.querySelectorAll("#about > details:nth-of-type(1) .about-value");[copy.primaryValue,copy.juniorValue,copy.seniorValue,copy.bachelorValue,copy.masterValue].forEach((text,index)=>{if(aboutValues[index])aboutValues[index].textContent=text});
  document.querySelectorAll(".awards-panel .about-key").forEach((el,index)=>{if(index<2)el.textContent=copy.awardKey});
  const awardValues=document.querySelectorAll(".awards-panel .about-value");[copy.mechAward,copy.mathAward,copy.icpc2024,copy.ccpc2025,copy.gplt,copy.baiduStar,copy.lanqiao].forEach((text,index)=>{if(awardValues[index])awardValues[index].textContent=text});
  setText("#skills > h2",copy.skillsTitle);setText("#projects > h2",copy.projectsTitle);
  const projectTitles=document.querySelectorAll(".project-title-btn"),projectTitleCopy=[copy.projectLifeTitle,copy.projectQuotesTitle,copy.projectKindleTitle,copy.projectYoutubeTitle],projectAriaCopy=[copy.projectLifeAria,copy.projectQuotesAria,copy.projectKindleAria,copy.projectYoutubeAria];projectTitles.forEach((el,index)=>{if(projectTitleCopy[index]){el.textContent=projectTitleCopy[index];el.setAttribute("aria-label",projectAriaCopy[index])}});
  const projectDescriptions=document.querySelectorAll(".project-grid .card p");[copy.projectLifeDesc,copy.projectQuotesDesc,copy.projectKindleDesc,copy.projectYoutubeDesc].forEach((text,index)=>{if(projectDescriptions[index])projectDescriptions[index].textContent=text});
  setText("#contact > h2",copy.contactTitle);setHtml("#contact > p",copy.contactHtml);
  setAttr("#live2d-settings-toggle","aria-label",copy.live2dOpen);setAttr("#live2d-settings-panel","aria-label",copy.live2dSettings);setText(".live2d-settings-panel .control-group:nth-of-type(1) .control-title",copy.live2dModel);setAttr("#live2d-model","aria-label",copy.chooseLive2dModel);const live2dSizeTitle=$(".live2d-settings-panel .control-group:nth-of-type(2) .control-title");if(live2dSizeTitle&&live2dSizeValue)live2dSizeTitle.firstChild.nodeValue=`${copy.live2dSize} `;setAttr("#live2d-size","aria-label",copy.adjustLive2dSize);
  setText('.jump-btn[href="#page-top"]',copy.top);setAttr('.jump-btn[href="#page-top"]',"aria-label",copy.topAria);setText('.jump-btn[href="#page-bottom"]',copy.bottom);setAttr('.jump-btn[href="#page-bottom"]',"aria-label",copy.bottomAria);
  setText(".design-style-switch > span",copy.style);setAttr(".design-style-switch","aria-label",copy.styleAria);setAttr(".design-style-options","aria-label",copy.styleGroup);setText(".view-mode-switch > span",copy.view);setAttr(".view-mode-switch","aria-label",copy.viewAria);setAttr(".view-mode-options","aria-label",copy.viewGroup);setText('.view-mode-btn[data-layout-mode="desktop"]',copy.desktop);setText('.view-mode-btn[data-layout-mode="mobile"]',copy.mobile);
  setAttr(".social-xhs","aria-label",copy.xhs);setAttr(".social-xhs","title",copy.xhs);setAttr(".social-links-bottom .social-xhs","aria-label",copy.xhsHome);setAttr(".social-github","aria-label","GitHub");setAttr(".social-github","title","GitHub");setAttr(".social-links-bottom .social-github","aria-label",copy.githubHome);setAttr(".social-bilibili","aria-label","Bilibili");setAttr(".social-bilibili","title","Bilibili");setAttr(".social-links-bottom .social-bilibili","aria-label",copy.bilibiliHome);
  localStorage.setItem("languageMode",safe);playModeUI();updateMusicButtonState();
};
const setSidebarCollapsed=(collapsed)=>{
  document.body.classList.toggle("sidebar-collapsed",collapsed);
  if(sidebarToggle)sidebarToggle.setAttribute("aria-pressed",String(collapsed));
  localStorage.setItem("sidebarCollapsed",String(collapsed));
  applyLanguage(currentLanguage);
};
let sidebarActiveLockId=null,sidebarActiveLockTimer=null;
const updateSidebarActive=(targetId=null)=>{
  const sections=["hero","about","skills","projects","contact","page-bottom"].map(id=>document.getElementById(id)).filter(Boolean);
  const scrollMax=document.documentElement.scrollHeight-window.innerHeight;
  const atPageEnd=scrollMax>0&&window.scrollY>=scrollMax-Math.min(180,window.innerHeight*0.18);
  const probeY=Math.min(window.innerHeight*0.38,360);
  const hashId=window.location.hash?decodeURIComponent(window.location.hash.slice(1)):"";
  const endTarget=targetId||sidebarActiveLockId||hashId;
  const current=targetId||sidebarActiveLockId||(atPageEnd&&["contact","page-bottom"].includes(endTarget)?endTarget:sections.reduce((active,section)=>section.getBoundingClientRect().top<=probeY?section.id:active,"hero"));
  const activeMap={hero:"home",about:"about",skills:"skills",projects:"projects",contact:"contact","page-bottom":"settings"};
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
const projectAvatarUrl="assets/avatar.png";const loadProjectAvatar=()=>{const saved=localStorage.getItem("sidebarAvatar");const img=new Image();img.onload=()=>{localStorage.setItem("sidebarAvatarSource","project");applySidebarAvatar(projectAvatarUrl+"?v="+Date.now())};img.onerror=()=>{localStorage.removeItem("sidebarAvatarSource");if(saved&&saved.startsWith("data:"))applySidebarAvatar(saved)};img.src=projectAvatarUrl+"?v="+Date.now()};loadProjectAvatar();applyStyle(localStorage.getItem("stylePreset")||"apple");applyLayoutMode(detectLayoutMode());applyLanguage(currentLanguage);controls();playModeUI();updateSidebarActive();
const bgOn=true,bgRole=localStorage.getItem("bgCharacter")||"02";localStorage.setItem("bgEnabled","true");if(bgToggle)bgToggle.checked=bgOn;if(bgCharacterSelect)bgCharacterSelect.value=bgCount[bgRole]?bgRole:"02";if(bgPlayModeSelect)bgPlayModeSelect.value=bgPlayMode;applyBg(bgOn,bgRole);
if(musicToggle)musicToggle.checked=musicEnabled;if(musicVolumeInput){musicVolumeInput.value=String(Math.round(player.volume*100));musicVolumeInput.style.setProperty("--vol",`${Math.round(player.volume*100)}%`)}[styleSelect,bgCharacterSelect,bgPlayModeSelect,live2dModelSelect].forEach(fit);
window.addEventListener("resize",()=>{applyLayoutMode(detectLayoutMode());updateSidebarActive()},{passive:true});
designStyleButtons.forEach(button=>button.addEventListener("click",()=>withViewportPreserved(()=>{applyStyle(button.dataset.designStyle);showToast(ui("styleUpdated"))},{frames:3,anchor:button})));
if(styleSelect)styleSelect.addEventListener("change",e=>withViewportPreserved(()=>{applyStyle(e.target.value);fit(styleSelect);showToast(ui("styleUpdated"))},{frames:3,anchor:styleSelect}));
if(languageToggle)languageToggle.addEventListener("click",()=>withViewportPreserved(()=>{applyLanguage(currentLanguage==="en"?"zh":"en");showToast(ui("languageUpdated"))},{frames:3,anchor:languageToggle}));
const isLocalEnv=()=>window.location.protocol==="file:"||window.location.hostname==="127.0.0.1"||window.location.hostname==="localhost";
if(sidebarAvatarButton&&sidebarAvatarInput){if(isLocalEnv()){sidebarAvatarButton.addEventListener("click",()=>sidebarAvatarInput.click())}else{sidebarAvatarButton.style.pointerEvents="none";sidebarAvatarButton.title=currentLanguage==="en"?"Avatar set by site owner":"头像由站长设置"}}
if(sidebarAvatarInput)sidebarAvatarInput.addEventListener("change",()=>{if(!isLocalEnv())return;const file=sidebarAvatarInput.files?.[0];if(!file||!file.type.startsWith("image/"))return;const reader=new FileReader();reader.addEventListener("load",async()=>{const src=String(reader.result||"");if(!src)return;try{localStorage.setItem("sidebarAvatar",src);applySidebarAvatar(src);const saved=await fetch("/api/save-avatar",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image:src})}).then(r=>r.ok).catch(()=>false);showToast(saved?(currentLanguage==="en"?"Avatar saved to project":"头像已保存到项目中"):(currentLanguage==="en"?"Avatar updated — place avatar.png into assets/ folder":"头像已更新 — 请将下载的 avatar.png 放入 assets/ 文件夹"))}catch{showToast(currentLanguage==="en"?"Image is too large":"图片太大了")}});reader.readAsDataURL(file);sidebarAvatarInput.value=""});
if(sidebarToggle)sidebarToggle.addEventListener("click",()=>setSidebarCollapsed(!document.body.classList.contains("sidebar-collapsed")));
sidebarLinks.forEach(link=>link.addEventListener("click",()=>{const href=link.getAttribute("href");if(href?.startsWith("#")){const targetId=href.slice(1);lockSidebarActive(targetId);scrollToSidebarTarget(targetId)}}));
window.addEventListener("scroll",()=>updateSidebarActive(),{passive:true});
document.querySelectorAll(".btn, .social-links a, .jump-btn, .sidebar-link, .design-style-btn, .view-mode-btn, .language-switch, .live2d-settings-toggle, .card").forEach(el=>{el.addEventListener("pointermove",e=>{const r=el.getBoundingClientRect();el.style.setProperty("--mx",((e.clientX-r.left)/r.width*100)+"%");el.style.setProperty("--my",((e.clientY-r.top)/r.height*100)+"%")});el.addEventListener("pointerleave",()=>{el.style.removeProperty("--mx");el.style.removeProperty("--my")})});
layoutModeButtons.forEach(button=>button.addEventListener("click",()=>withViewportPreserved(()=>{const mode=button.dataset.layoutMode==="mobile"?"mobile":"desktop";applyLayoutMode(mode);if(mode==="desktop")requestAnimationFrame(()=>requestAnimationFrame(()=>{if(typeof applyLive2dSettings==="function")applyLive2dSettings()}));showToast(mode==="mobile"?ui("mobileLayout"):ui("desktopLayout"))},{frames:4})));
if(bgCharacterSelect)bgCharacterSelect.addEventListener("change",e=>withViewportPreserved(()=>{if(_suppressSelectChange){_suppressSelectChange=false;return}localStorage.setItem("bgCharacter",e.target.value);applyBg(true,e.target.value);showToast(ui("bgRoleChanged"))}));
if(bgPlayModeSelect)bgPlayModeSelect.addEventListener("change",e=>withViewportPreserved(()=>{bgPlayMode=e.target.value==="all"?"all":"single";localStorage.setItem("bgPlayMode",bgPlayMode);playModeUI();showToast(ui("playModeUpdated"))}));
if(musicToggle)musicToggle.addEventListener("change",()=>withViewportPreserved(()=>{musicEnabled=musicToggle.checked;localStorage.setItem("musicEnabled",String(musicEnabled));if(musicEnabled){isPagePaused=false;localStorage.setItem("pagePaused","false");clearInterval(bgTimer);if(isViewerEnabled())showScene(currentRole,{withMusic:true})}else{player.pause();scheduleBgOnly()}controls();showToast(musicEnabled?ui("musicOn"):ui("musicOff"))}));
if(musicVolumeInput)musicVolumeInput.addEventListener("input",()=>{const v=Math.min(100,Math.max(0,Number(musicVolumeInput.value)||0));player.volume=v/100;localStorage.setItem("musicVolume",String(player.volume));musicVolumeInput.style.setProperty("--vol",`${v}%`)});
if(live2dModelSelect)live2dModelSelect.addEventListener("change",()=>withViewportPreserved(()=>{const modelKey=getLive2dModelKey(live2dModelSelect.value);localStorage.setItem("live2dModel",modelKey);if(typeof switchLive2dModel==="function")switchLive2dModel(modelKey);showToast(ui("live2dModelChanged"))}));
let live2dSizeInputFrame=0;
if(live2dSizeInput)live2dSizeInput.addEventListener("input",()=>{if(live2dSizeInputFrame)cancelAnimationFrame(live2dSizeInputFrame);live2dSizeInputFrame=requestAnimationFrame(()=>{live2dSizeInputFrame=0;setLive2dSizePercent(live2dSizeInput.value,{freezePanel:true})})});
if(headerMusicNextButton)headerMusicNextButton.addEventListener("click",()=>withViewportPreserved(()=>{playNext();showToast(bgPlayMode==="single"?ui("songChanged"):ui("roleChanged"))}));if(headerImageNextButton)headerImageNextButton.addEventListener("click",()=>withViewportPreserved(()=>{nextImageOnly();showToast(ui("imageChanged"))}));
if(pageMuteToggleButton)pageMuteToggleButton.addEventListener("click",()=>withViewportPreserved(()=>{isPagePaused=!isPagePaused;localStorage.setItem("pagePaused",String(isPagePaused));if(isPagePaused){player.pause()}else if(musicEnabled){if(player.src)player.play().then(startMusicProgressLoop).catch(()=>{});else showScene(currentRole,{withMusic:true})}controls();showToast(currentLanguage==="en"?(isPagePaused?"Music paused":"Music resumed"):(isPagePaused?"音乐已暂停":"音乐继续播放"))}));
if(yearSpan)yearSpan.textContent=String(new Date().getFullYear());
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
const LIVE2D_EDGE_MARGIN=12;
const getLive2dBaseSize=()=>{const w=Math.min(280,window.innerWidth*0.48),h=Math.min(560,window.innerHeight*0.82);return {width:w,height:h}};
const getLive2dMaxScale=()=>{const {width,height}=getLive2dBaseSize();const maxW=(window.innerWidth-LIVE2D_EDGE_MARGIN*2)/Math.max(1,width),maxH=(window.innerHeight-LIVE2D_EDGE_MARGIN*2)/Math.max(1,height);return Math.max(0.6,Math.min(1.6,maxW,maxH))};
const normalizeLive2dSizePercent=(value)=>{const requested=Math.min(160,Math.max(60,Number(value)||100));return Math.round(Math.min(requested,getLive2dMaxScale()*100))};
const getLive2dScale=()=>Math.min(getLive2dMaxScale(),Math.max(0.6,Number(live2dWidget?.style.getPropertyValue("--live2d-size"))||normalizeLive2dSizePercent(localStorage.getItem("live2dSize"))/100));
const getLive2dMetrics=(scale=getLive2dScale(),custom=live2dWidget?.classList.contains("live2d-custom-position"))=>{const {width,height}=getLive2dBaseSize();const visualWidth=width*scale,visualHeight=height*scale;return {scale,width,height,visualWidth,visualHeight,offsetX:0,offsetY:custom?0:height-visualHeight}};
const clampLive2dVisualLeftTop=(x,y,scale=getLive2dScale())=>{const {visualWidth,visualHeight}=getLive2dMetrics(scale,true);const maxX=window.innerWidth-LIVE2D_EDGE_MARGIN-visualWidth,maxY=window.innerHeight-LIVE2D_EDGE_MARGIN-visualHeight;return {x:clamp(x,LIVE2D_EDGE_MARGIN,Math.max(LIVE2D_EDGE_MARGIN,maxX)),y:clamp(y,LIVE2D_EDGE_MARGIN,Math.max(LIVE2D_EDGE_MARGIN,maxY))}};
const positionLive2dChrome=({freezePanel=false}={})=>{if(!live2dWidget)return;const metrics=getLive2dMetrics();const rect=live2dWidget.getBoundingClientRect();const visualLeft=rect.left+metrics.offsetX,visualRight=visualLeft+metrics.visualWidth;const enoughRight=window.innerWidth-visualRight>=64||visualLeft<64;const toggleX=enoughRight?metrics.offsetX+metrics.visualWidth+8:metrics.offsetX-52;const toggleY=metrics.offsetY+metrics.visualHeight*0.42;live2dWidget.style.setProperty("--live2d-toggle-x",`${toggleX}px`);live2dWidget.style.setProperty("--live2d-toggle-y",`${toggleY}px`);if(!freezePanel){const panelX=enoughRight?metrics.offsetX+metrics.visualWidth+12:metrics.offsetX-226;live2dWidget.style.setProperty("--live2d-panel-x",`${panelX}px`);live2dWidget.style.setProperty("--live2d-panel-y",`${toggleY+32}px`)}};
const setLive2dSizePercent=(value,{freezePanel=false}={})=>{if(!live2dWidget)return normalizeLive2dSizePercent(value);const size=normalizeLive2dSizePercent(value);localStorage.setItem("live2dSize",String(size));live2dWidget.style.setProperty("--live2d-size",String(size/100));const custom=live2dWidget.classList.contains("live2d-custom-position");if(custom){const currentX=Number.parseFloat(live2dWidget.style.left)||live2dWidget.getBoundingClientRect().left,currentY=Number.parseFloat(live2dWidget.style.top)||live2dWidget.getBoundingClientRect().top;const next=clampLive2dVisualLeftTop(currentX,currentY,size/100);live2dWidget.style.setProperty("--live2d-x",`${next.x}px`);live2dWidget.style.setProperty("--live2d-y",`${next.y}px`);live2dWidget.style.left=`${next.x}px`;live2dWidget.style.top=`${next.y}px`;localStorage.setItem("live2dX",String(next.x));localStorage.setItem("live2dY",String(next.y))}if(live2dSizeInput)live2dSizeInput.value=String(size);if(live2dSizeValue)live2dSizeValue.textContent=`${size}%`;positionLive2dChrome({freezePanel});scheduleLive2dRelayout();return size};
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
    const left=`${LIVE2D_EDGE_MARGIN}px`;
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
      const rect=live2dCanvas.getBoundingClientRect();
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
      const metrics=getLive2dMetrics();
      const dialogHalf=Math.min(110,Math.max(72,window.innerWidth*0.26));
      const absoluteX=live2dWidget.getBoundingClientRect().left+metrics.offsetX+x*metrics.scale;
      const safeAbsoluteX=clamp(absoluteX,dialogHalf+LIVE2D_EDGE_MARGIN,window.innerWidth-dialogHalf-LIVE2D_EDGE_MARGIN);
      live2dWidget.style.setProperty("--live2d-dialog-x",`${safeAbsoluteX-live2dWidget.getBoundingClientRect().left}px`);
      live2dWidget.style.setProperty("--live2d-dialog-y",`${metrics.offsetY+y*metrics.scale}px`);
      positionLive2dChrome({freezePanel:live2dControlsActive});
    };
    app.ticker.add(()=>{hideConfiguredModelMarks();applyManualFocus();updateLive2dDialogAnchor()},undefined,-100);
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
    const hitLive2dBounds=(event,{pad=18}={})=>{
      if(!model||!live2dWidget)return false;
      try{
        const bounds=model.getBounds?.();
        if(!bounds||!Number.isFinite(bounds.x)||!Number.isFinite(bounds.y)||bounds.width<=0||bounds.height<=0)return false;
        const metrics=getLive2dMetrics();
        const rect=live2dWidget.getBoundingClientRect();
        const left=rect.left+metrics.offsetX+bounds.x*metrics.scale-pad;
        const top=rect.top+metrics.offsetY+bounds.y*metrics.scale-pad;
        const right=rect.left+metrics.offsetX+(bounds.x+bounds.width)*metrics.scale+pad;
        const bottom=rect.top+metrics.offsetY+(bounds.y+bounds.height)*metrics.scale+pad;
        return event.clientX>=left&&event.clientX<=right&&event.clientY>=top&&event.clientY<=bottom;
      }catch{
        return false;
      }
    };
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
    const beginLive2dDrag=(e)=>{
      if(isLive2dSettingsTarget(e.target))return;
      if(!hitLive2dBounds(e)&&!hitLive2dPixel(e))return;
      const rect=live2dCanvas.getBoundingClientRect();
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
const flashSection=(sec,delay=0)=>{if(!sec)return;window.setTimeout(()=>{sec.classList.remove("flash-highlight");sec.querySelectorAll(".section-glow-ring").forEach(ring=>ring.remove());void sec.offsetWidth;const ring=document.createElement("span");ring.className="section-glow-ring";ring.setAttribute("aria-hidden","true");sec.appendChild(ring);sec.classList.add("flash-highlight");window.clearTimeout(sec._flashHighlightTimer);sec._flashHighlightTimer=window.setTimeout(()=>{sec.classList.remove("flash-highlight");ring.remove()},820)},delay)};
const getHashSection=()=>{const id=window.location.hash?decodeURIComponent(window.location.hash.slice(1)):"";return id?document.getElementById(id):null};
hashActionLinks.forEach(a=>a.addEventListener("click",()=>{const id=a.getAttribute("href"),sec=id&&id.startsWith("#")?document.getElementById(id.slice(1)):null;if(!sec)return;lastHashClickAt=Date.now();flashSection(sec,240)}));
window.addEventListener("hashchange",()=>{if(Date.now()-lastHashClickAt<800)return;flashSection(getHashSection(),240)});
if(document.readyState==="complete")flashSection(getHashSection(),320);else window.addEventListener("load",()=>flashSection(getHashSection(),320));
document.addEventListener("click",e=>{if(e.target.closest("a,button,input,select,label,summary,details,.quick-jump,.live2d-widget"))return;showClickText(e.clientX,e.clientY)});

document.querySelectorAll("[data-char-slide]").forEach(el=>{const text=el.textContent||"";el.textContent="";[...text].forEach((char,i)=>{const span=document.createElement("span");span.className="char-slide";span.style.animationDelay=i*0.028+"s";span.textContent=char===" "?" ":char;el.appendChild(span)})});

let speedPxPerSec=100;
const projectGrid=document.querySelector("#projects .project-grid");
if(projectGrid){const viewport=document.createElement("div");viewport.className="project-scroll-viewport";const track=document.createElement("div");track.className="project-scroll-track";const clone=projectGrid.cloneNode(true);clone.querySelectorAll(".reveal-on-scroll").forEach(el=>{el.classList.remove("reveal-on-scroll","reveal-fade","reveal-slide-up","reveal-blur","reveal-visible")});projectGrid.parentNode.insertBefore(viewport,projectGrid);track.appendChild(projectGrid);track.appendChild(clone);viewport.appendChild(track);
let scrollPaused=false,scrollPos=0,lastTime=0;
const getGridWidth=()=>projectGrid.getBoundingClientRect().width+24;
viewport.addEventListener("pointerenter",()=>{scrollPaused=true});
viewport.addEventListener("pointerleave",()=>{scrollPaused=false});
const animateScroll=(time)=>{const dt=lastTime?(time-lastTime)/1000:0;lastTime=time;if(!scrollPaused&&dt>0&&dt<0.5){const gridWidth=getGridWidth();scrollPos-=speedPxPerSec*dt;if(scrollPos<=-gridWidth)scrollPos+=gridWidth;track.style.transform=`translateX(${scrollPos.toFixed(2)}px)`}requestAnimationFrame(animateScroll)};
requestAnimationFrame(animateScroll)}

	/* ---- 项目卡片滚动速度调节 ---- */
	const speedToggle=$("#project-speed-toggle"),speedPanel=$("#project-speed-panel"),speedSlider=$("#project-speed-slider"),speedValue=$("#project-speed-value");
	if(speedToggle&&speedPanel&&speedSlider&&speedValue){
	  speedToggle.addEventListener("click",e=>{
	    e.stopPropagation();
	    const show=!speedPanel.hidden;
	    speedPanel.hidden=show;
	    speedToggle.setAttribute("aria-expanded",String(!show));
	  });
	  speedPanel.addEventListener("click",e=>e.stopPropagation());
	  speedPanel.addEventListener("pointerdown",e=>e.stopPropagation());
	  document.addEventListener("click",()=>{
	    if(!speedPanel.hidden){speedPanel.hidden=true;speedToggle.setAttribute("aria-expanded","false")}
	  });
	  speedSlider.addEventListener("input",()=>{
	    speedPxPerSec=Number(speedSlider.value);
	    speedValue.textContent=speedSlider.value;
	  });
	}
