const yearSpan = document.querySelector("#year");
const styleSelect = document.querySelector("#style-select");
const bgToggle = document.querySelector("#bg-toggle");
const bgCharacterSelect = document.querySelector("#bg-character-select");
const bgCharacterWrap = document.querySelector("#bg-character-wrap");
const bgPlayModeSelect = document.querySelector("#bg-play-mode");
const musicToggle = document.querySelector("#music-toggle");
const musicPlayPauseButton = document.querySelector("#music-playpause");
const musicVolumeInput = document.querySelector("#music-volume");
const musicNextButton = document.querySelector("#music-next");
const headerMusicNextButton = document.querySelector("#header-music-next");
const pageMuteToggleButton = document.querySelector("#page-mute-toggle");
const floatingControls = document.querySelector(".floating-controls");
const controlsToggleButton = document.querySelector("#controls-toggle");
const controlsPinInput = document.querySelector("#controls-pin");
const bgLayerA = document.querySelector("#bg-layer-a");
const bgLayerB = document.querySelector("#bg-layer-b");
const heroActionLinks = document.querySelectorAll(".hero-actions a[href^='#']");
const visitorLocationGreeting = document.querySelector("#visitor-location-greeting");
const BG_ROTATE_MS = 3000;
let bgRotationTimer = null;
let activeBgLayer = null;
const bgSequenceIndexByRole = {};
let bgPlayMode = localStorage.getItem("bgPlayMode") || "single";
const savedMusicEnabledRaw = localStorage.getItem("musicEnabled");
let isMusicEnabled = savedMusicEnabledRaw === null ? true : savedMusicEnabledRaw === "true";
let currentMusicKey = null;
const musicSequenceIndexByRole = {};
let musicVolume = localStorage.getItem("musicVolume");
let globalRoleShuffleQueue = [];
let currentGlobalRole = null;
let lastGlobalRole = null;
let controlsPinned = localStorage.getItem("controlsPinned") === "true";
let controlsOpen = localStorage.getItem("controlsOpen");
let isPageMuted = localStorage.getItem("pageMuted") === "true";
let wasAutoMuted = false;
let needsUserGestureToPlay = false;

if (controlsOpen === null) {
  controlsOpen = true;
} else {
  controlsOpen = controlsOpen === "true";
}

const roleMusicPlayer = new Audio();
roleMusicPlayer.loop = false;
roleMusicPlayer.preload = "auto";

if (musicVolume === null) {
  musicVolume = 0.6;
} else {
  const parsed = Number(musicVolume);
  musicVolume = Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0.6;
}
roleMusicPlayer.volume = musicVolume;
roleMusicPlayer.muted = isPageMuted;

const styleClassNames = ["style-warm", "style-tech", "style-minimal", "style-melancholy"];
const styleMap = {
  warm: "style-warm",
  tech: "style-tech",
  minimal: "style-minimal",
  melancholy: "style-melancholy",
};

const applyStyle = (styleKey) => {
  const safeStyle = styleMap[styleKey] ? styleKey : "warm";
  document.body.classList.remove(...styleClassNames);
  document.body.classList.add(styleMap[safeStyle]);
  if (styleSelect) {
    styleSelect.value = safeStyle;
  }
};

const savedStyle = localStorage.getItem("stylePreset") || "warm";
applyStyle(savedStyle);

const applyControlsUI = () => {
  if (!floatingControls) {
    return;
  }
  floatingControls.classList.toggle("floating-controls-open", controlsOpen);
  if (controlsToggleButton) {
    controlsToggleButton.textContent = controlsOpen ? "◀" : "▶";
  }
  if (controlsPinInput) {
    controlsPinInput.checked = controlsPinned;
  }
  if (pageMuteToggleButton) {
    pageMuteToggleButton.classList.toggle("muted", isPageMuted);
    pageMuteToggleButton.setAttribute("aria-label", isPageMuted ? "取消网页静音" : "网页静音");
    pageMuteToggleButton.setAttribute("title", isPageMuted ? "取消静音" : "静音");
  }
};

const applyPlayModeUI = () => {
  const isSingle = bgPlayMode === "single";
  if (bgCharacterSelect) {
    bgCharacterSelect.disabled = !isSingle;
  }
  if (musicNextButton) {
    musicNextButton.disabled = false;
    musicNextButton.title = isSingle ? "切歌" : "切角色";
  }
  if (headerMusicNextButton) {
    headerMusicNextButton.disabled = false;
    headerMusicNextButton.title = isSingle ? "切歌" : "切角色";
    headerMusicNextButton.setAttribute("aria-label", isSingle ? "切换当前角色下一首歌曲" : "切换到下一个角色并播放对应音乐");
  }
  if (musicPlayPauseButton) {
    musicPlayPauseButton.disabled = !isMusicEnabled;
  }
};

const fitSelectToOptions = (selectEl) => {
  if (!selectEl) return;
  const options = Array.from(selectEl.options || []);
  const maxLen = Math.max(0, ...options.map((o) => (o.textContent || "").trim().length));
  // Rough width estimate: text + padding + arrow space.
  selectEl.style.width = `calc(${Math.max(4, maxLen)}ch + 3.2rem)`;
};

const backgroundBasePath = "assets/backgrounds";
const characterFolders = {
  "02": "02",
  chitanda: "chitanda",
  kaguya: "kaguya",
  yachiyo: "yachiyo",
  iroha: "iroha",
  eriyi: "eriyi",
  elaina: "elaina",
  chtholly: "chtholly",
  sora: "sora",
  akame: "akame",
  mine: "mine",
  esdeath: "esdeath",
  krul: "krul",
  shinoa: "shinoa",
  violet: "violet",
  toki: "toki",
};

const musicBasePath = "assets/music";
const characterMusicFolders = {
  "02": "02",
  chitanda: "chitanda",
  kaguya: "kaguya",
  yachiyo: "yachiyo",
  iroha: "iroha",
  eriyi: "eriyi",
  elaina: "elaina",
  chtholly: "chtholly",
  sora: "sora",
  akame: "akame",
  mine: "mine",
  esdeath: "esdeath",
  krul: "krul",
  shinoa: "shinoa",
  violet: "violet",
  toki: "toki",
};

// Set music track count for each character folder.
// Example: if assets/music/02/ has 1.mp3, 2.mp3, 3.mp3 then set 3.
const characterMusicTrackCount = {
  "02": 4,
  chitanda: 2,
  kaguya: 1,
  yachiyo: 1,
  iroha: 1,
  eriyi: 2,
  elaina: 1,
  chtholly: 1,
  sora: 3,
  akame: 4,
  mine: 4,
  esdeath: 4,
  krul: 1,
  shinoa: 1,
  violet: 4,
  toki: 4,
};

// Set image count for each character folder.
// Example: if assets/backgrounds/02/ has 1.jpg, 2.jpg, 3.jpg then set 3.
const characterImageCount = {
  "02": 2,
  chitanda: 3,
  kaguya: 1,
  yachiyo: 4,
  iroha: 2,
  eriyi: 1,
  elaina: 4,
  chtholly: 1,
  sora: 1,
  akame: 1,
  mine: 3,
  esdeath: 4,
  krul: 4,
  shinoa: 4,
  violet: 7,
  toki: 6,
};

const getAllCharacterKeys = () => Object.keys(characterFolders);
const pickRandomCharacterKey = () => {
  const keys = getAllCharacterKeys();
  if (keys.length === 0) {
    return "02";
  }
  const idx = Math.floor(Math.random() * keys.length);
  return keys[idx];
};

const pickNextImageIndex = (characterKey) => {
  const safeCharacter = characterFolders[characterKey] ? characterKey : "02";
  const maxCount = getImageCount(safeCharacter);
  const currentIndex = Number(bgSequenceIndexByRole[safeCharacter] || 0);
  const nextIndex = currentIndex >= maxCount ? 1 : currentIndex + 1;
  bgSequenceIndexByRole[safeCharacter] = nextIndex;
  return nextIndex;
};

const buildBackgroundPath = (characterKey, imageIndex) => {
  const safeCharacter = characterFolders[characterKey] ? characterKey : "02";
  const folderName = characterFolders[safeCharacter];
  const randomIndex = imageIndex || 1;
  return `${backgroundBasePath}/${folderName}/${randomIndex}.jpg`;
};

const getImageCount = (characterKey) => {
  const safeCharacter = characterFolders[characterKey] ? characterKey : "02";
  return Math.max(1, Number(characterImageCount[safeCharacter]) || 1);
};

const buildGlobalRoleShuffledQueue = () => {
  const roles = getAllCharacterKeys();
  for (let i = roles.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }
  if (roles.length > 1 && lastGlobalRole && roles[0] === lastGlobalRole) {
    [roles[0], roles[1]] = [roles[1], roles[0]];
  }
  return roles;
};

const pickNextGlobalRole = () => {
  if (globalRoleShuffleQueue.length === 0) {
    globalRoleShuffleQueue = buildGlobalRoleShuffledQueue();
  }
  const nextRole = globalRoleShuffleQueue.shift();
  lastGlobalRole = nextRole;
  return nextRole;
};

const getMusicTrackCount = (characterKey) => {
  const safeCharacter = characterMusicFolders[characterKey] ? characterKey : "02";
  return Math.max(1, Number(characterMusicTrackCount[safeCharacter]) || 1);
};

const pickNextMusicTrackIndex = (characterKey) => {
  const safeCharacter = characterMusicFolders[characterKey] ? characterKey : "02";
  const maxCount = getMusicTrackCount(safeCharacter);
  const currentIndex = Number(musicSequenceIndexByRole[safeCharacter] || 0);
  const nextIndex = currentIndex >= maxCount ? 1 : currentIndex + 1;
  musicSequenceIndexByRole[safeCharacter] = nextIndex;
  return nextIndex;
};

const buildMusicPath = (characterKey, trackIndex) => {
  const safeCharacter = characterMusicFolders[characterKey] ? characterKey : "02";
  const folderName = characterMusicFolders[safeCharacter];
  const safeIndex = trackIndex || 1;
  return `${musicBasePath}/${folderName}/${safeIndex}.mp3`;
};

const playRoleMusic = (characterKey) => {
  const safeCharacter = characterMusicFolders[characterKey] ? characterKey : "02";

  if (currentMusicKey !== safeCharacter) {
    currentMusicKey = safeCharacter;
  }

  if (!isMusicEnabled) {
    return;
  }

  const trackIndex = pickNextMusicTrackIndex(safeCharacter);
  const nextSrc = buildMusicPath(safeCharacter, trackIndex);
  roleMusicPlayer.src = nextSrc;
  roleMusicPlayer.play().catch(() => {
    // Autoplay may be blocked until user interacts.
    needsUserGestureToPlay = true;
  });
};

const applyMusicState = (enabled, characterKey) => {
  isMusicEnabled = enabled;
  if (musicToggle) {
    musicToggle.checked = enabled;
  }
  if (!enabled) {
    roleMusicPlayer.pause();
    if (musicPlayPauseButton) {
      musicPlayPauseButton.textContent = "播放";
      musicPlayPauseButton.disabled = true;
    }
    return;
  }
  if (musicPlayPauseButton) {
    musicPlayPauseButton.disabled = false;
  }
  playRoleMusic(characterKey);
};

const playNextTrackNow = () => {
  if (bgPlayMode === "all") {
    const nextRole = pickNextGlobalRole();
    currentGlobalRole = nextRole;
    if (bgCharacterSelect) {
      bgCharacterSelect.value = nextRole;
    }
    if (isMusicEnabled) {
      roleMusicPlayer.pause();
      roleMusicPlayer.currentTime = 0;
      playRoleMusic(nextRole);
    }
    return;
  }

  const selectedCharacter = bgCharacterSelect ? bgCharacterSelect.value : "02";
  if (!isMusicEnabled) {
    return;
  }
  roleMusicPlayer.pause();
  roleMusicPlayer.currentTime = 0;
  playRoleMusic(selectedCharacter);
};

const playNextSongForCurrentRole = () => {
  const selectedCharacter = bgCharacterSelect ? bgCharacterSelect.value : "02";
  if (!isMusicEnabled) {
    return;
  }
  // Title bar "切歌" is only for single role mode.
  if (bgPlayMode !== "single") {
    return;
  }
  roleMusicPlayer.pause();
  roleMusicPlayer.currentTime = 0;
  playRoleMusic(selectedCharacter);
};

const switchToRoleNow = (roleKey) => {
  const safeRole = characterFolders[roleKey] ? roleKey : "02";
  currentGlobalRole = safeRole;
  if (bgCharacterSelect) {
    bgCharacterSelect.value = safeRole;
  }

  // Switch image to the next sequential frame for this role immediately.
  const count = getImageCount(safeRole);
  if (count <= 1) {
    setBackgroundInstant(buildBackgroundPath(safeRole, 1));
  } else {
    const imageIndex = pickNextImageIndex(safeRole);
    crossfadeBackground(buildBackgroundPath(safeRole, imageIndex));
  }

  // Switch music to this role.
  if (isMusicEnabled) {
    roleMusicPlayer.pause();
    roleMusicPlayer.currentTime = 0;
    playRoleMusic(safeRole);
  }
};

const switchToNextRoleInAllMode = () => {
  if (bgPlayMode !== "all") {
    return;
  }
  const nextRole = pickNextGlobalRole();
  switchToRoleNow(nextRole);
};

roleMusicPlayer.addEventListener("ended", () => {
  if (!isMusicEnabled || !currentMusicKey) {
    return;
  }
  if (bgPlayMode === "all") {
    const nextRole = pickNextGlobalRole();
    currentGlobalRole = nextRole;
    if (bgCharacterSelect) {
      bgCharacterSelect.value = nextRole;
    }
    playRoleMusic(nextRole);
    return;
  }

  playRoleMusic(currentMusicKey);
});

roleMusicPlayer.addEventListener("play", () => {
  needsUserGestureToPlay = false;
  if (musicPlayPauseButton) {
    musicPlayPauseButton.textContent = "⏸";
  }
});

roleMusicPlayer.addEventListener("pause", () => {
  if (musicPlayPauseButton) {
    musicPlayPauseButton.textContent = "▶";
  }
});

const stopBackgroundRotation = () => {
  if (bgRotationTimer) {
    clearInterval(bgRotationTimer);
    bgRotationTimer = null;
  }
};

const clearBackgroundLayers = () => {
  if (bgLayerA) {
    bgLayerA.classList.remove("visible");
    bgLayerA.style.backgroundImage = "none";
  }
  if (bgLayerB) {
    bgLayerB.classList.remove("visible");
    bgLayerB.style.backgroundImage = "none";
  }
  activeBgLayer = null;
};

const crossfadeBackground = (imagePath) => {
  if (!bgLayerA || !bgLayerB) {
    return;
  }
  if (!activeBgLayer) {
    bgLayerA.style.backgroundImage = `url("${imagePath}")`;
    bgLayerA.classList.add("visible");
    bgLayerB.classList.remove("visible");
    activeBgLayer = bgLayerA;
    return;
  }
  const nextLayer = activeBgLayer === bgLayerA ? bgLayerB : bgLayerA;
  nextLayer.style.backgroundImage = `url("${imagePath}")`;
  nextLayer.classList.add("visible");
  activeBgLayer.classList.remove("visible");
  activeBgLayer = nextLayer;
};

const setBackgroundInstant = (imagePath) => {
  if (!bgLayerA || !bgLayerB) {
    return;
  }
  bgLayerA.style.backgroundImage = `url("${imagePath}")`;
  bgLayerA.classList.add("visible");
  bgLayerB.classList.remove("visible");
  bgLayerB.style.backgroundImage = "none";
  activeBgLayer = bgLayerA;
};

const startBackgroundRotation = (characterKey) => {
  const safeCharacter = characterFolders[characterKey] ? characterKey : "02";
  stopBackgroundRotation();
  globalRoleShuffleQueue = [];

  if (bgPlayMode === "all") {
    // Start from selected role, then advance by music end.
    currentGlobalRole = safeCharacter;
    lastGlobalRole = safeCharacter;
    if (bgCharacterSelect) {
      bgCharacterSelect.value = safeCharacter;
    }
    if (isMusicEnabled) {
      playRoleMusic(safeCharacter);
    }
  }

  const imageCount = getImageCount(safeCharacter);

  if (bgPlayMode === "single" && imageCount <= 1) {
    const singleImagePath = buildBackgroundPath(safeCharacter, 1);
    setBackgroundInstant(singleImagePath);
    return;
  }

  const applyNextImage = () => {
    if (bgPlayMode === "all") {
      const role = currentGlobalRole || safeCharacter;
      const count = getImageCount(role);
      if (count <= 1) {
        setBackgroundInstant(buildBackgroundPath(role, 1));
        return;
      }
      const imageIndex = pickNextImageIndex(role);
      const imagePath = buildBackgroundPath(role, imageIndex);
      crossfadeBackground(imagePath);
      return;
    }

    const imageIndex = pickNextImageIndex(safeCharacter);
    const imagePath = buildBackgroundPath(safeCharacter, imageIndex);
    crossfadeBackground(imagePath);
  };
  applyNextImage();
  bgRotationTimer = setInterval(applyNextImage, BG_ROTATE_MS);
};

const applyCharacterBackground = (enabled, characterKey) => {
  const safeCharacter = characterFolders[characterKey] ? characterKey : "02";
  if (bgCharacterSelect) {
    bgCharacterSelect.value = safeCharacter;
    bgCharacterSelect.disabled = !enabled;
  }
  if (bgToggle) {
    bgToggle.checked = enabled;
  }
  if (enabled) {
    startBackgroundRotation(safeCharacter);
  } else {
    stopBackgroundRotation();
    clearBackgroundLayers();
  }
  if (bgPlayMode === "single") {
    playRoleMusic(safeCharacter);
  }
};

const savedBgEnabledRaw = localStorage.getItem("bgEnabled");
const savedBgEnabled = savedBgEnabledRaw === null ? true : savedBgEnabledRaw === "true";
const initialRandomCharacter = pickRandomCharacterKey();
applyCharacterBackground(savedBgEnabled, initialRandomCharacter);
applyMusicState(isMusicEnabled, initialRandomCharacter);

if (bgPlayModeSelect) {
  bgPlayModeSelect.value = bgPlayMode === "all" ? "all" : "single";
}

applyPlayModeUI();
applyControlsUI();

fitSelectToOptions(styleSelect);
fitSelectToOptions(bgCharacterSelect);
fitSelectToOptions(bgPlayModeSelect);

const tryResumeAfterGesture = () => {
  if (!needsUserGestureToPlay || !isMusicEnabled) {
    return;
  }
  roleMusicPlayer.play().catch(() => {});
};

const ensurePlaybackOnRefresh = () => {
  if (!isMusicEnabled) {
    return;
  }
  if (roleMusicPlayer.src) {
    roleMusicPlayer.play().catch(() => {
      // If autoplay with sound is blocked, fall back to muted autoplay.
      needsUserGestureToPlay = true;
      if (!roleMusicPlayer.muted) {
        isPageMuted = true;
        roleMusicPlayer.muted = true;
        // Do NOT persist auto-mute to next visits.
        wasAutoMuted = true;
        applyControlsUI();
        roleMusicPlayer.play().catch(() => {});
      }
    });
    return;
  }
  const selectedCharacter = bgCharacterSelect ? bgCharacterSelect.value : "02";
  playRoleMusic(selectedCharacter);
};

const applyVisitorLocationGreeting = async () => {
  if (!visitorLocationGreeting) {
    return;
  }
  const readCachedLocation = () => {
    try {
      const raw = localStorage.getItem("visitorLocationCache");
      if (!raw) return "";
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return "";
      const name = typeof parsed.name === "string" ? parsed.name.trim() : "";
      const ts = Number(parsed.ts || 0);
      const isFresh = Date.now() - ts < 24 * 60 * 60 * 1000;
      return isFresh ? name : "";
    } catch (error) {
      return "";
    }
  };

  const writeCachedLocation = (name) => {
    if (!name) return;
    try {
      localStorage.setItem(
        "visitorLocationCache",
        JSON.stringify({
          name,
          ts: Date.now(),
        }),
      );
    } catch (error) {}
  };

  const fetchJson = async (url, timeoutMs = 3200) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) {
      throw new Error(`request failed: ${response.status}`);
    }
    return response.json();
  };

  const resolveLocationName = async () => {
    // 1) ipapi
    try {
      const data = await fetchJson("https://ipapi.co/json/");
      const city = (data?.city ? String(data.city).trim() : "") || "";
      const region = (data?.region ? String(data.region).trim() : "") || "";
      const country = (data?.country_name ? String(data.country_name).trim() : "") || "";
      const name = city || region || country;
      if (name) return name;
    } catch (error) {}

    // 2) ipwho.is
    try {
      const data = await fetchJson("https://ipwho.is/");
      if (data?.success === false) {
        throw new Error("ipwhois failed");
      }
      const city = (data?.city ? String(data.city).trim() : "") || "";
      const region = (data?.region ? String(data.region).trim() : "") || "";
      const country = (data?.country ? String(data.country).trim() : "") || "";
      const name = city || region || country;
      if (name) return name;
    } catch (error) {}

    // 3) ipinfo
    try {
      const data = await fetchJson("https://ipinfo.io/json");
      const city = (data?.city ? String(data.city).trim() : "") || "";
      const region = (data?.region ? String(data.region).trim() : "") || "";
      const country = (data?.country ? String(data.country).trim() : "") || "";
      const name = city || region || country;
      if (name) return name;
    } catch (error) {}

    // 4) geolocation-db
    try {
      const data = await fetchJson("https://geolocation-db.com/json/");
      const city = (data?.city ? String(data.city).trim() : "") || "";
      const region = (data?.state ? String(data.state).trim() : "") || "";
      const country = (data?.country_name ? String(data.country_name).trim() : "") || "";
      const name = city || region || country;
      if (name) return name;
    } catch (error) {}

    return "";
  };

  try {
    const cached = readCachedLocation();
    if (cached) {
      visitorLocationGreeting.textContent = `欢迎来自${cached}的朋友！`;
      return;
    }
    const locationName = await resolveLocationName();
    if (locationName) {
      writeCachedLocation(locationName);
      visitorLocationGreeting.textContent = `欢迎来自${locationName}的朋友！`;
      return;
    }
    visitorLocationGreeting.textContent = "欢迎来自远方的朋友！";
  } catch (error) {
    visitorLocationGreeting.textContent = "欢迎来自远方的朋友！";
  }
};

document.addEventListener("pointerdown", tryResumeAfterGesture, { passive: true });
document.addEventListener("keydown", tryResumeAfterGesture);
window.addEventListener("load", ensurePlaybackOnRefresh);
window.addEventListener("pageshow", ensurePlaybackOnRefresh);
window.addEventListener("focus", ensurePlaybackOnRefresh);
window.addEventListener("load", () => {
  applyVisitorLocationGreeting();
});
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    ensurePlaybackOnRefresh();
  }
});

if (styleSelect) {
  styleSelect.addEventListener("change", (event) => {
    const selectedStyle = event.target.value;
    applyStyle(selectedStyle);
    localStorage.setItem("stylePreset", selectedStyle);
  });
}

if (bgToggle) {
  bgToggle.addEventListener("change", () => {
    const enabled = bgToggle.checked;
    const selectedCharacter = bgCharacterSelect ? bgCharacterSelect.value : "02";
    applyCharacterBackground(enabled, selectedCharacter);
    localStorage.setItem("bgEnabled", String(enabled));
    localStorage.setItem("bgCharacter", selectedCharacter);
  });
}

if (bgCharacterSelect) {
  bgCharacterSelect.addEventListener("change", (event) => {
    const selectedCharacter = event.target.value;
    const enabled = bgToggle ? bgToggle.checked : false;
    applyCharacterBackground(enabled, selectedCharacter);
    localStorage.setItem("bgCharacter", selectedCharacter);
    if (enabled) {
      localStorage.setItem("bgEnabled", "true");
    }
  });
}

if (styleSelect) {
  styleSelect.addEventListener("change", () => fitSelectToOptions(styleSelect));
}

if (bgPlayModeSelect) {
  bgPlayModeSelect.addEventListener("change", () => fitSelectToOptions(bgPlayModeSelect));
}

if (bgPlayModeSelect) {
  bgPlayModeSelect.addEventListener("change", (event) => {
    bgPlayMode = event.target.value === "all" ? "all" : "single";
    localStorage.setItem("bgPlayMode", bgPlayMode);
    applyPlayModeUI();
    const enabled = bgToggle ? bgToggle.checked : false;
    const selectedCharacter = bgCharacterSelect ? bgCharacterSelect.value : "02";
    if (enabled) {
      startBackgroundRotation(selectedCharacter);
    }
  });
}

if (musicToggle) {
  musicToggle.checked = isMusicEnabled;
  musicToggle.addEventListener("change", () => {
    const enabled = musicToggle.checked;
    const selectedCharacter = bgCharacterSelect ? bgCharacterSelect.value : "02";
    applyMusicState(enabled, selectedCharacter);
    localStorage.setItem("musicEnabled", String(enabled));
  });
}

if (musicPlayPauseButton) {
  // Default button label
  musicPlayPauseButton.textContent = "▶";
  musicPlayPauseButton.disabled = !isMusicEnabled;
  musicPlayPauseButton.addEventListener("click", () => {
    if (!isMusicEnabled) {
      return;
    }
    if (!roleMusicPlayer.src) {
      const selectedCharacter = bgCharacterSelect ? bgCharacterSelect.value : "02";
      playRoleMusic(selectedCharacter);
      return;
    }
    if (roleMusicPlayer.paused) {
      roleMusicPlayer.play().catch(() => {});
    } else {
      roleMusicPlayer.pause();
    }
  });
}

if (musicVolumeInput) {
  musicVolumeInput.value = String(Math.round(musicVolume * 100));
  musicVolumeInput.style.setProperty("--vol", `${Math.round(musicVolume * 100)}%`);
  musicVolumeInput.addEventListener("input", () => {
    const v = Number(musicVolumeInput.value);
    const next = Number.isFinite(v) ? Math.min(100, Math.max(0, v)) : 60;
    const normalized = next / 100;
    roleMusicPlayer.volume = normalized;
    localStorage.setItem("musicVolume", String(normalized));
    musicVolumeInput.style.setProperty("--vol", `${next}%`);
  });
}

if (musicNextButton) {
  musicNextButton.textContent = bgPlayMode === "single" ? "切歌" : "切角色";
  musicNextButton.addEventListener("click", () => {
    playNextTrackNow();
  });
}

if (headerMusicNextButton) {
  headerMusicNextButton.addEventListener("click", () => {
    if (bgPlayMode === "all") {
      switchToNextRoleInAllMode();
      return;
    }
    playNextSongForCurrentRole();
  });
}

if (pageMuteToggleButton) {
  pageMuteToggleButton.addEventListener("click", () => {
    isPageMuted = !isPageMuted;
    roleMusicPlayer.muted = isPageMuted;
    localStorage.setItem("pageMuted", String(isPageMuted));
    wasAutoMuted = false;
    applyControlsUI();
  });
}

if (controlsToggleButton) {
  controlsToggleButton.addEventListener("click", () => {
    controlsOpen = !controlsOpen;
    localStorage.setItem("controlsOpen", String(controlsOpen));
    applyControlsUI();
  });
}

if (controlsPinInput) {
  controlsPinInput.addEventListener("change", () => {
    controlsPinned = controlsPinInput.checked;
    localStorage.setItem("controlsPinned", String(controlsPinned));
    if (controlsPinned) {
      controlsOpen = true;
      localStorage.setItem("controlsOpen", "true");
    }
    applyControlsUI();
  });
}

if (floatingControls) {
  // Click-only sidebar behavior: no hover-to-open/close.
  document.addEventListener("click", (event) => {
    if (controlsPinned || !controlsOpen) {
      return;
    }
    if (floatingControls.contains(event.target)) {
      return;
    }
    controlsOpen = false;
    localStorage.setItem("controlsOpen", "false");
    applyControlsUI();
  });
}

if (yearSpan) {
  yearSpan.textContent = String(new Date().getFullYear());
}

if (heroActionLinks.length > 0) {
  heroActionLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const targetId = link.getAttribute("href");
      if (!targetId || !targetId.startsWith("#")) {
        return;
      }
      const targetSection = document.querySelector(targetId);
      if (!targetSection) {
        return;
      }
      setTimeout(() => {
        targetSection.classList.remove("flash-highlight");
        // Force reflow so repeated clicks restart animation.
        void targetSection.offsetWidth;
        targetSection.classList.add("flash-highlight");
      }, 280);
    });
  });
}
