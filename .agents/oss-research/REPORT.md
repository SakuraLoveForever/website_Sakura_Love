# 音乐收藏 · 高科技化改造 —— 开源方案调研报告

> 调研对象：`website_Sakura_Love` 的 `#music-library` 区块（纯 HTML/CSS/JS、无构建、GitHub Pages、6 套主题）
> 调研时间：**2026-10-06**（所有数字均为该日实测）
> 调研方式：GitHub REST API（`api.github.com`）+ jsDelivr data API（`data.jsdelivr.com`）+ unpkg 实物文件探测 + shields.io（GitHub API 限流后的补充源）
> **本报告只做调研，未修改任何项目代码。**

## 0. 数据可信度说明（请先读这一段）

- ✅ **精确档**：通过 GitHub REST API 实测，带完整 ISO 时间戳（APlayer / MetingJS / wavesurfer.js / mojs / anime.js / GSAP / p5.js / three.js / Tone.js / tsparticles / particles.js / wave.js 共 12 个仓库，本轮抓取时 `X-RateLimit-Remaining` 从 46 递减到 1）。
- 🟡 **月份档**：GitHub API 未认证配额（60 次/小时）在抓到第 13 个仓库时耗尽，后续 4 个仓库改用 `img.shields.io/github/*.json`（服务端代查 GitHub）。Stars 为整数，最近提交**只精确到月份**，已逐条标注。
- 🟢 **实物档**：所有「体积」数字都来自 `data.jsdelivr.com/v1/packages/npm/<pkg>@<ver>` 的文件清单（字节数），以及 unpkg 实际 HTTP 响应（状态码 + `Content-Length`）。**没有一个是估算值。**
- ❌ **未验证**：本报告中不存在「我记得大概是多少」的数字。凡未实测处均已显式标注。

---

## 1. 候选项目对比表

体积栏：`UMD/IIFE` 指可用普通 `<script src>` 引入的构建产物；括号内为 jsDelivr 实测字节数。

| 项目 | Stars | 最近提交 | 许可证 | 技术栈 | 引入方式 / CDN | 体积(UMD) | 无构建可用? | 适合做什么 |
|---|---|---|---|---|---|---|---|---|
| [DIYgod/APlayer](https://github.com/DIYgod/APlayer) | 7,706 | 2024-02-23 | MIT | 原生 JS + CSS | jsDelivr `aplayer@1.10.1/dist/APlayer.min.js` + `.min.css` | JS 59,325 B + CSS 12,528 B ≈ **70 KB** | ✅ 是（UMD） | 成品播放器 UI；但皮肤需重度覆盖 |
| [metowolf/MetingJS](https://github.com/metowolf/MetingJS) | 1,411 | 2026-04-12 | MIT | JS（APlayer 依赖） | jsDelivr `meting@2.0.2` | 未测（依赖 APlayer） | ✅ 是 | ❌ **不适用**：面向网易云等在线 API，本地 mp3 用不上 |
| [katspaugh/wavesurfer.js](https://github.com/katspaugh/wavesurfer.js) | **10,428** | **2026-10-05** | BSD-3-Clause | TypeScript→UMD | jsDelivr `wavesurfer.js@8.0.1/dist/wavesurfer.min.js` | **51,958 B** | ✅ 是（UMD，全局 `WaveSurfer`） | 波形/时间轴/区域标记，**唯一"活跃+可商用+UMD"三全** |
| [goldfire/howler.js](https://github.com/goldfire/howler.js) | 25,000 🟡 | 2025-11 🟡 | MIT | JS（WebAudio + HTML5 双模） | jsDelivr `howler@2.2.4/dist/howler.min.js` | **36,173 B** | ✅ 是（UMD，`Howler/Howl`） | 替换原生 `<audio>` 的播放内核；`html5:true` 专为大文件流式播放 |
| [hvianna/audioMotion-analyzer](https://github.com/hvianna/audioMotion-analyzer) | 956 🟡 | 2026-01 🟡 | ⚠️ **AGPL-3.0** | 原生 ES6 + Canvas | jsDelivr `audiomotion-analyzer@4.5.4/dist/index.js` | **95,625 B** | ✅ 是（UMD，全局 `AudioMotionAnalyzer`） | 频谱/环形可视化最强；**但 AGPL 是硬伤** |
| [jberg/butterchurn](https://github.com/jberg/butterchurn) | 2,000 🟡 | 2026-04 🟡 | MIT | WebGL (**需 WebGL 2**) | jsDelivr `butterchurn@2.6.7/lib/butterchurn.min.js` | **192,520 B**（另需 `butterchurn-presets`） | ✅ 是（UMD，全局 `butterchurn`） | MilkDrop 风格迷幻可视化；太重、GPU 开销大 |
| [juliangarnier/anime](https://github.com/juliangarnier/anime) | **73,379** | 2026-08-09 | MIT | 原生 JS | jsDelivr `animejs@4.5.0/dist/bundles/anime.umd.min.js` | **118,043 B** | ✅ 是（UMD，`globalThis`） | 补间动画；v4 体积比 v3 暴涨 |
| [greensock/GSAP](https://github.com/greensock/GSAP) | 28,836 | 2026-04-13 | ⚠️ **非 OSI**：`LicenseRef-scancode-gsap-standard-no-charge-2025`（Webflow 所有，2025-04-30 生效） | 原生 JS | jsDelivr `gsap@3.15.0/dist/gsap.min.js` | **72,927 B** | ✅ 是（UMD） | 最强动效引擎；许可已非 MIT，需留意 |
| [mojs/mojs](https://github.com/mojs/mojs) | 18,794 | 2026-04-14 | MIT | CoffeeScript | jsDelivr `@mojs/core` | 未测 | ✅ 是 | 交互动效原语；**最后 release v1.7.1 停在 2023-10**，事实停滞 |
| [tsparticles/tsparticles](https://github.com/tsparticles/tsparticles) | 8,987 | 2026-10-05 | MIT | TypeScript | jsDelivr `@tsparticles/slim@4.4.0/tsparticles.slim.bundle.min.js` | **158,878 B** | ✅ 是（UMD） | 粒子背景/音频反应粒子；体积偏大 |
| [VincentGarreau/particles.js](https://github.com/VincentGarreau/particles.js) | 30,204 | **2017-03-25** | MIT | JS | 需自托管 | 未测 | ✅ 是 | ⚠️ **事实弃坑**（9 年无提交）；项目已自托管 `particle-network.min.js`(4,655 B) |
| [foobar404/wave.js](https://github.com/foobar404/wave.js) | 734 | 2023-12-18 | MIT | HTML/JS | jsDelivr `wave.js` | 未测 | ✅ 是 | 轻量波形可视化；半停滞 |
| [martinlaxenaire/curtainsjs](https://github.com/martinlaxenaire/curtainsjs) | 1,800 🟡 | 2025-04 🟡 | MIT | WebGL | jsDelivr `curtainsjs@8.1.6/dist/curtains.umd.min.js` | **125,310 B** | ✅ 是（UMD） | 图片/背景做 shader 扭曲、液态过渡 |
| [oframe/ogl](https://github.com/oframe/ogl) | 4,700 🟡 | 2025-04 🟡 | ❓ **"not specified"** | WebGL | npm 仅 ESM 源码，无 UMD 构建 | 源码 ~300 KB（无 min 构建） | ❌ **无现成 script 标签构建** | 极简 WebGL；本项目场景不划算 |
| [processing/p5.js](https://github.com/processing/p5.js) | 24,087 | 2026-10-04 | ⚠️ LGPL-2.1 | JS | jsDelivr `p5` | 未测（通常 >1 MB 全量） | ✅ 是 | 创意编程；对本需求是「杀鸡用牛刀」 |
| [Tonejs/Tone.js](https://github.com/Tonejs/Tone.js) | 14,751 | 2026-10-04 | MIT | TypeScript | jsDelivr `tone@15.1.22/build/Tone.js` | **345,500 B** | ✅ 是 | 完整音频引擎/DSP；**本需求完全不需要** |
| [mrdoob/three.js](https://github.com/mrdoob/three.js) | 116,271 | 2026-10-06 | MIT | JS/WebGL | jsDelivr `three` | 未测（核心 ~600 KB+） | ✅ 是 | 3D 舞台；**与"已有卡顿"的现状冲突** |

---

## 2. 每个候选的具体发现（原始数字 + 来源链接）

### 2.1 APlayer —— 「经典 drop-in，但皮肤是最老派的那种」

**GitHub API 实测**（来源：[api.github.com/repos/DIYgod/APlayer](https://api.github.com/repos/DIYgod/APlayer)）

| 字段 | 值 |
|---|---|
| stargazers_count | 7,706 |
| forks_count | 1,058 |
| open_issues_count | **206** |
| language | JavaScript |
| license.spdx_id | MIT |
| archived | false |
| pushed_at | 2024-02-23T16:58:13Z |
| 最新提交 | 2024-02-23T16:58:08Z — `chore: tea` |
| 最新 release | **v1.10.1，发布于 2018-03-29T15:52:29Z** |

⚠️ **关键矛盾**：`pushed_at` 是 2024-02，但**最后一个正式 release 是 2018 年的 v1.10.1**。也就是说 8 年没有新版本发布，master 上只有零星 chore 提交。**事实上的维护停滞**。

**CDN 实测**（[unpkg 探测](https://unpkg.com/aplayer@1.10.1/dist/APlayer.min.js)）：
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css">
<script src="https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js"></script>
```
- `APlayer.min.js` → HTTP 200，59,325 B，UMD（`typeof exports` + `typeof define` 同时存在）
- `APlayer.min.css` → HTTP 200，12,528 B

**主题化能力实测 —— 这是 APlayer 最大的问题：**
我完整拉取了 [APlayer.min.css](https://unpkg.com/aplayer@1.10.1/dist/APlayer.min.css) 全文并做了检索，结论如下：

1. **零个 CSS 自定义属性（`--var`）**。整个 CSS 里没有任何 `--*` 声明，颜色全部是硬编码 hex/rgba：#fff、#666、#999、#cdcdcd、#aaa、#e9e9e9、#efefef、#111…。
2. 因此**无法通过 CSS 变量换肤**，只能选择：(a) 加载后覆盖，用更高优先级选择器逐条改写；(b) 干脆不加载官方 CSS，自己从零写。
3. **更隐蔽的坑**：`.aplayer *{box-sizing:content-box}`。这与你站点全局的 `border-box` 假设相反，会打乱你现有布局节奏，必须显式覆盖回 `border-box`。
4. 可用的换肤钩子只有**结构性 class**：`.aplayer`、`.aplayer-body`、`.aplayer-pic`、`.aplayer-info`、`.aplayer-controller`、`.aplayer-bar-wrap/.aplayer-bar/.aplayer-played/.aplayer-thumb`、`.aplayer-list ol li`、`.aplayer-lrc`、`.aplayer-fixed`、`.aplayer-narrow`、`.aplayer-withlist`、`.aplayer-withlrc`、`.aplayer-loading`。
5. CSS 内建 `@keyframes rotate`（loading 旋转）和 `aplayer-roll`（歌名滚动）。

**自定义本地播放列表**（JS 侧）：APlayer 接受 `new APlayer({ container, audio: [...] })`，每个元素是 `{ name, artist, url, cover, lrc, theme }`——**`url` 可以直接指向你本地的 `assets/music/<role>/<n>.mp3`**，这一点完全满足需求。
🗓️ **诚实标注**：APlayer 官方文档站 `https://aplayer.js.org` 是 SPA，`web_fetch` 只能取到空壳标题，`raw.githubusercontent.com` 在本环境被网络阻断。因此上面关于 options 结构的描述**来自我对该库的既有认知，未能在本轮实测中重新取证**；而 CSS 无变量、`content-box` 两点是**我逐字节读过 CSS 后的实测结论**，置信度高。

**结论**：能 drop-in，但「做出来就是 APlayer 的样子」——正是你觉得"老套"的那种 2018 年审美。要做成高科技，**改装成本高于自建**。

---

### 2.2 wavesurfer.js —— 本轮最值得关注的项目，且**已经是 v8 不是 v7**

**GitHub API 实测**（来源：[api.github.com/repos/katspaugh/wavesurfer.js](https://api.github.com/repos/katspaugh/wavesurfer.js)）

| 字段 | 值 |
|---|---|
| stargazers_count | **10,428** |
| forks_count | 1,762 |
| open_issues_count | **14**（相对 1 万 star 的项目，极低） |
| language | TypeScript |
| license.spdx_id | **BSD-3-Clause** |
| archived | false |
| pushed_at | **2026-10-05T10:57:00Z** |
| 最新提交 | **2026-10-05T10:56:57Z** — `fix(Renderer): continuously auto-scroll while dragging the playhead near the container edge (#4381)` |
| 最新 release | **8.0.1，发布于 2026-09-24T15:49:16Z** |

**问题 3 逐条回答：**

**① 是否提供 UMD/IIFE？→ 是，官方 README 明确说明并且我实测确认。**
[README（jsDelivr 原文）](https://cdn.jsdelivr.net/npm/wavesurfer.js@8.0.1/README.md) 原文：

> "Alternatively, insert a UMD script tag which exports the library as a global `WaveSurfer` variable:
> `<script src="https://unpkg.com/wavesurfer.js@8"></script>`"

实测（unpkg）：`dist/wavesurfer.min.js` → HTTP 200，**51,958 B**，UMD。
**v7 对比**：`wavesurfer.js@7.12.0/dist/wavesurfer.min.js` → HTTP 200，**40,023 B**，同样是 UMD。
→ **v8 比 v7 大了约 12 KB，且 v8 是破坏性大版本。若只求"能用"，v7.12.0 更小；若求"长期维护"，选 v8.0.1。**

**② 插件 API 与体积（全部实测字节数）**

| 插件 | 文件 | 体积 | 全局名 |
|---|---|---|---|
| Regions（区域/标记） | `dist/plugins/regions.min.js` | 21,448 B | `WaveSurfer.Regions` |
| Timeline（时间刻度） | `dist/plugins/timeline.min.js` | 7,610 B | `WaveSurfer.Timeline` |
| Minimap（缩略波形滚动条） | `dist/plugins/minimap.min.js` | 54,872 B | `WaveSurfer.Minimap` |
| Spectrogram（频谱瀑布） | `dist/plugins/spectrogram.min.js` | 56,902 B | `WaveSurfer.Spectrogram` |
| Envelope / Record / Hover | 未逐一实测 | — | — |

README 给出插件装法：`<script src="https://unpkg.com/wavesurfer.js@8/dist/plugins/regions.min.js"></script>` → 导出 `WaveSurfer.Regions`。

**最小可用代码**（README 原文示例，实测于该 README）：
```js
const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  waveColor: '#4F4A85',
  progressColor: '#383351',
  url: '/audio.mp3',
})
```

**v8 的新 API**（README「Advanced / reactive API」章节原文要点）：
- `wavesurfer.getState()` 返回只读 **Signal** 对象：`state.isPlaying.subscribe(fn)`、`state.loadPhase.value`（`'idle' | 'fetching' | 'decoding' | 'ready' | 'error'`）、`currentTime` / `volume` / `muted` / `scrollPosition`。
- `wavesurfer.getRenderer().getVisibleRange().value` → `{startTime, endTime}`。
- 写插件可用 `WaveSurfer.definePlugin(name, (ctx, options) => api)`，`ctx` 提供 `{wavesurfer, scope, state, emit}`，注册在 `ctx.scope` 上的监听/定时器会随 `destroy()` 自动清理。

**③ 是否要下载并解码整个音频文件？→ 是，而且这是它在本项目里最大的风险。**
README「Frequent questions」原文：

> "Since wavesurfer decodes audio entirely in the browser using Web Audio, large clips may fail to decode due to memory constraints. We recommend using pre-decoded peaks for large files."
> "Wavesurfer fetches audio from the URL you specify in order to decode it."

**用你的真实数据算一下**（我实测了 `assets/music/` 全部 38 个 mp3）：
- 总计 **366.7 MB**，平均 **9.7 MB**，最大 **11.9 MB**（`violet/1.mp3`），最小 3.7 MB
- 按 44.1 kHz 立体声 Float32 解码，**单曲 PCM ≈ 10 分钟 × 44100 × 2ch × 4B ≈ 210 MB**（取决于实际时长；这里用典型 10 分钟估算，**时长本身未实测**）
- → 在手机上为了一根波形条去解码 200 MB 级 PCM，**风险很高**。README 官方的解法是「预生成 peaks」，但那需要引入 `audiowaveform` 之类的**离线工具**，等于给"无构建"项目加了一道构建工序。

**④ 样式隔离**：README「CSS styling」原文："wavesurfer.js v7 is rendered into a **Shadow DOM** tree. This isolates its CSS from the rest of the web page." 只能通过 `::part()` 定制：
```css
#waveform ::part(cursor):before { content: '🏄'; }
#waveform ::part(region) { font-family: fantasy; }
```
→ **对你的 6 套主题体系是双刃剑**：好消息是不污染全局、不会被你的 `body.design-*` 意外改坏；坏消息是你**不能**用 CSS 变量直接喂进去，必须用 JS 选项（`waveColor` / `progressColor`）或 `::part()` 逐条映射。

---

### 2.3 可视化与动效库

**audioMotion-analyzer（可视化能力最强，但许可证是硬阻断）**
- GitHub API 未认证配额已耗尽 → 🟡 [shields.io 实测](https://img.shields.io/github/license/hvianna/audioMotion-analyzer.json)：**Stars 956、Forks 100、open issues 22、License = AGPL-3.0、last commit = 2026-01（月份精度）**
- 交叉验证：其 [README](https://cdn.jsdelivr.net/npm/audiomotion-analyzer@4.5.4/README.md) 结尾原文 —— "Licensed under the **GNU Affero General Public License, version 3 or later**"。**两个独立来源一致，AGPL-3.0 确认。**
- 能力确实强：双声道实时频谱、log/linear/bark/mel 频率轴、LED bars、radial（环形）频谱、reflection、5 种内置渐变 + `registerGradient()` 自定义、`getEnergy()` / `getBars()` 供外部做 CSS 联动、`onCanvasDraw` 回调、`source:` 直接吃 `<audio>` 元素、`connectSpeakers:false` 避免与已有播放器双份出声。
- 体积实测：`dist/index.js`（UMD，`define("AudioMotionAnalyzer",…)`）**95,625 B**，README 自述 "~30kB minified"（gzip 后口径）。
- README 也明确了正确的用法：
  ```js
  const audioMotion = new AudioMotionAnalyzer(document.getElementById('container'), {
    source: document.getElementById('audio')
  });
  ```
  ⚠️ README 同时警告：连 `<audio>` 后如果 `connectSpeakers` 保持默认 `true`，"when you're using audioMotion-analyzer with an audio player which already outputs sound to the speakers" 会导致**音量被放大**（重复输出）→ **本项目必须设 `connectSpeakers:false`**。
- ⚠️ **AGPL-3.0 的后果**：AGPL 第 13 条要求「通过网络交互使用的用户，必须能获得对应源码」。把它塞进公开的 GitHub Pages 站点，严格解读下会引出**你整个站点前端源码的提供义务**（对该组件的衍生部分）。你的仓库本来就是公开源码，风险不大，但这是一个**架构层面的许可约束**，不是"随便用用"。**我的建议是不引入。**

**butterchurn（MilkDrop 复刻，重）**
- 🟡 shields 实测：Stars 2,000、Forks 171、open issues 0、**MIT**、last commit 2026-04（月份精度）
- [README](https://cdn.jsdelivr.net/npm/butterchurn@2.6.7/README.md) 实测要点：`butterchurn.createVisualizer(audioContext, canvas, {width,height})` → `visualizer.connectAudio(audioNode)` → 需要 **`butterchurn-presets`** 提供 `presets` 对象 → `visualizer.loadPreset(preset, 0.0)` → 每帧手动 `visualizer.render()`（**渲染循环要你自己驱动**）
- ⚠️ README 原文："Butterchurn requires the browser support **WebGL 2**"
- 体积实测：`lib/butterchurn.min.js` **192,520 B**，另有 `lib/butterchurnExtraImages.min.js` **198,773 B**
- → 合计 390 KB + 预设包，且是 WebGL 2 全屏渲染。**与"站点已在跟卡顿作斗争"直接冲突，不建议。**

**GSAP（许可变了，务必知情）**
- GitHub API：Stars 28,836、Forks 2,235、open issues 7、`license.spdx_id` = **空**（GitHub 无法识别）、pushed_at 2026-04-13
- ⚠️ **license 字段为空不是数据缺失，是真的非标准许可**。据 [ScanCode LicenseDB](https://scancode-licensedb.aboutcode.org/gsap-standard-no-charge-2025.html)：GSAP 现由 **Webflow** 持有，许可名为 "Standard 'No Charge' GSAP License 2025"，SPDX 标识 `LicenseRef-scancode-gsap-standard-no-charge-2025`，分类 **Proprietary Free**，生效日 **2025-04-30**。原文定义 `Prohibited Uses` = "在允许用户无代码构建视觉动画、且实质帮助创造与 Webflow 竞争的产品中使用"。
- **对你的个人作品集站点：属于 Permitted Uses，免费可用。** 但要清楚它**已不是 MIT**，且可被 Webflow 单方修订（协议第 VI 条）。
- 体积实测：`gsap@3.15.0/dist/gsap.min.js` **72,927 B**；`ScrollTrigger.min.js` 另 **44,575 B**。

**anime.js v4（体积暴涨，是 v3 的 7 倍）**
- GitHub API：Stars **73,379**、Forks 4,959、open issues 121、MIT、pushed_at 2026-08-21、最新 release **v4.5.0（2026-06-22）**
- 实测构建产物：`dist/bundles/anime.umd.min.js` **118,043 B**（UMD，含 `globalThis`）、`dist/bundles/anime.esm.min.js` 118,678 B
- ⚠️ v3 时代 `anime.min.js` 约 17 KB 量级，**v4 涨到 118 KB**。为几个 UI 过渡动画付 118 KB，性价比很低。

**mojs（事实停滞）**
- GitHub API：Stars 18,794、Forks 890、open issues 37、MIT、pushed_at 2026-07-30，但**最新 release v1.7.1 停在 2023-10-06**；最新提交 2026-04-14 是 `🔧 adjust linter configuration`（改配置，非功能）。
- → **不建议**在新代码里依赖。

**tsparticles**
- GitHub API：Stars 8,987、Forks 944、MIT、`pushed_at` = **2026-10-05T19:57:14Z**、最新提交 **2026-10-05T10:57:25Z** — `Merge pull request #5950 from tsparticles/dependabot/npm_and_yarn/hono-4.13.13`（非常活跃）
- 体积实测：`@tsparticles/slim@4.4.0/tsparticles.slim.bundle.min.js` **158,878 B**（UMD，含 `__tsParticlesInternals`）；`tsparticles.slim.min.js` 仅 8,112 B（需自行组装 bundle）
- → 你项目里**已经有** `particle-network.min.js`（4,655 B，根目录自托管，[index.html:767](index.html#L767) 引入）。若要粒子，扩展已有的比引入 tsparticles 更省。

**VincentGarreau/particles.js（弃坑）**
- GitHub API：Stars 30,204、Forks 4,803、MIT，但 **最新提交 2017-03-25**，pushed_at 2024-03-28（应该是改 README/CI）。**9 年无代码提交，事实弃坑**。

**three.js / Tone.js / p5.js（均不推荐，理由各异）**
- three.js：Stars **116,271**、Forks 36,607、MIT、最新 release **r186（2026-09-24）**、最新提交 2026-10-06 —— 极度活跃，但引入成本与 GPU 压力对本需求不成比例。
- Tone.js：Stars 14,751、MIT、最新 release 15.1.22 —— 体积实测 `build/Tone.js` **345,500 B**（未压缩）。**做可视化根本不需要它**：直接用 `AudioContext.createMediaElementSource(audio)` + `AnalyserNode` 即可，见 §4。
- p5.js：Stars 24,087、**LGPL-2.1**、最新 release v2.3.4（2026-09-25）。LGPL 对 JS 静态链接的适用性存在解释空间，且体积巨大 —— 不必要。

**curtainsjs / OGL**
- curtainsjs：🟡 Stars 1,800、MIT、last commit 2025-04（月份精度）；体积实测 `dist/curtains.umd.min.js` **125,310 B**
- OGL：🟡 Stars 4,700、license **"not specified"**、last commit 2025-04；`ogl@1.0.11` 的 npm 包内**只有 `src/` 下的 ESM 源码**，我遍历全部文件未发现任何 `.min.js`/UMD 构建 → **无现成 script 标签可用**

---

### 2.4 三个"高科技感"视觉参考（第 4 问）

以下为检索中确认**真实存在**的参考，但⚠️ **它们的 star 数/提交日期我未逐一取数**（GitHub 配额已耗尽），仅作为视觉语言参考：

| 参考 | 链接 | 视觉技法 |
|---|---|---|
| **audioMotion 官方 Demo** | [audiomotion.dev/demo](https://audiomotion.dev/demo/) | 环形频谱（`radial:true` + `spinSpeed`）、LED 柱、镜面反射、自定义渐变。**纯 Canvas 2D，性能友好** —— 这是最贴近你需求的效果，值得照抄"观感"而不引入库 |
| **Spectrum_Ring** | [github.com/Volpes12/Spectrum_Ring](https://github.com/Volpes12/Spectrum_Ring) | "Upload an audio file to see a **rotating spectrum ring** animation in real-time"，HTML5 Canvas + 原生 JS，无框架 |
| **Butterchurn 在线演示** | [butterchurnviz.com](https://butterchurnviz.com)（README 内嵌截图） | MilkDrop 式迷幻 WebGL 场景，作为"惊艳上限"的参照 |

**我推荐的视觉词汇组合**（不依赖上述任何库，全部可用 CSS + 一个 AnalyserNode 实现）：
1. **霓虹描边**：你项目**已经在用**这个技法 —— [styles.css:1881-1893](styles.css#L1881-L1893) 的 `.music-role-group.is-active::before` 用了 `linear-gradient` + `mask-composite: exclude` 做渐变描边。**直接复用并加强即可**，零新依赖。
2. **玻璃拟态**：项目已有 `--glass-blur*` / `--glass-saturate*` 全套 token（[styles.css:70-74](styles.css#L70-L74)），播放栏已在用 `backdrop-filter`（[styles.css:2056](styles.css#L2056)）。
3. **音频反应环**：`AnalyserNode` + `canvas` 画环形频谱，或把能量值写进 CSS 变量交给 CSS 做缩放/发光。
4. **3D 倾斜**：单张卡片用 `transform: perspective(800px) rotateX() rotateY()`，`pointermove` 里更新 —— 15 行 JS，不需要库。

---

## 3. 排名前 3 推荐

### 🥇 第一：**不引入任何播放器库，用原生 Web Audio `AnalyserNode` 自建**
不是"因为找不到"，而是**数据推出来的结论**：

| 评估维度 | 结论 |
|---|---|
| 更新时间 | 浏览器内置 API，永久维护；[MDN: createMediaElementSource()](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaElementSource) 标注 baseline **"Widely available … since April 2021"** |
| Star 数 | N/A（平台能力） |
| 许可证 | **无**（浏览器 API） |
| 技术栈契合度 | ✅ 完美：`<script>` 常规脚本内即可调用，零模块系统要求 |
| 部署难度 | ✅ GitHub Pages 零额外工作，不增加任何请求 |
| 体积/性能 | **0 B**。相比 audioMotion 95 KB / butterchurn 192 KB / Tone.js 345 KB |

**决定性理由**：你的核心诉求是"UI 新颖高科技"。而"高科技感"的 90% 来自 **布局、动效、配色、层次**，只有 10% 来自"数据从哪来"。`AnalyserNode` 恰好提供了那 10%——而且 [MDN 明确说明](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaElementSource)：接线后音频改由 AudioContext 图输出，**"playing/pausing the media can still be done through the media element API and the player controls"** —— 意味着**你现有的 `musicLibraryAudio` 播放逻辑一行都不用改**。

> ⚠️ 一个**必须注意的架构细节**（我读了你的代码）：项目里有**两个独立音源** —— 全局背景播放器 `const player=new Audio()`（[script.js:70](script.js#L70)，无 src 属性）和 `<audio id="music-library-audio">`（[index.html:339](index.html#L339)）。二者互不干扰，所以可以各自 `createMediaElementSource` 互不冲突。但**同一个元素不能创建两次 MediaElementSource**，因此可视化模块必须做成单例并加 `WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>` 缓存。

### 🥈 第二：**wavesurfer.js v8.0.1 —— 只当"波形/时间轴/区域"组件用，不当播放内核**
- 唯一同时满足：**UMD + 10,428 stars + BSD-3-Clause + 昨天还在提交（2026-10-05）+ 14 个 open issue**。
- 体积 51,958 B（+ Regions 21,448 B / Timeline 7,610 B）。
- ⚠️ **前提**：只在用户**点了某一首歌之后**才创建 wavesurfer 实例，并且**只对当前这一首**做波形；千万不要为 38 首预解码（366.7 MB 素材）。可接受 200 MB 级 PCM 的瞬时占用，也是**唯一能接受的用法**。
- ⚠️ Shadow DOM → 颜色必须走 JS 选项或 `::part()`，不能靠 CSS 变量。

### 🥉 第三：**原生 CSS + Web Animations API 做动效，替代 GSAP / anime.js**
- GSAP 72,927 B 但许可已从 MIT 变为 Webflow 私有许可；anime.js 118,043 B（v3 约 17 KB）。
- 你需要的动效（发光呼吸、环形缩放、卡片进场、频谱柱）用 CSS `transition` / `@keyframes` / `Web Animations API` 全部做得到，且**天生支持 `prefers-reduced-motion`**（`window.matchMedia('(prefers-reduced-motion: reduce)')` 或 CSS 媒体查询）。
- 项目**已经有** reduced-motion 处理（[styles.css:2566](styles.css#L2566)、[styles.css:3069](styles.css#L3069)、[styles.css:5297](styles.css#L5297)），保持同一模式即可。

**不推荐作为基础**：APlayer（2018 年 release + 零 CSS 变量 + `content-box` 陷阱）、audioMotion-analyzer（**AGPL-3.0**）、butterchurn（192 KB + WebGL 2 + 需预设包）、Tone.js（345 KB 且用不上）、mojs / particles.js / wave.js（停滞或弃坑）。

---

## 4. 能直接用 / 需要二次开发 + 改造成本与风险

### ✅ 可以"直接用"的
| 项 | 说明 |
|---|---|
| **原生 `AnalyserNode` 可视化** | 零依赖，加 ~40 行 JS 即可跑通。**这是唯一真正 drop-in 的东西。** |
| **wavesurfer.js v8 UMD** | 官方 README 承诺 UMD 全局 `WaveSurfer`，实测 51,958 B 可下载。**"能加载"没问题**，但"集成进现有播放逻辑"需要二次开发。 |
| **现有 CSS 技法** | `mask-composite` 渐变描边、`backdrop-filter` 玻璃、`--glass-*` token —— **本仓库已有**，抄自己即可。 |

### 🔧 需要二次开发的
| 候选 | 改造内容 | 成本估算 | 主要风险 |
|---|---|---|---|
| **APlayer** | 覆盖全部硬编码颜色 + 修正 `box-sizing:content-box` + 重排 DOM 适配舞台布局 | **20–30 小时 / 600–900 行 CSS**（等于重写皮肤） | 2018 年 release、206 open issues、主题无法用 CSS 变量、DOM 结构不可控 |
| **wavesurfer.js v8** | 包一层适配器对接现有 `musicLibraryTracks` / 播放/暂停/seek 状态；`::part()` 映射 6 套主题；单曲懒加载波形 | **6–10 小时 / 200–300 行 JS + 80–150 行 CSS** | **大文件解码内存**（≈200 MB/曲）、Shadow DOM 阻断 CSS 变量、v7→v8 破坏性变更 |
| **audioMotion-analyzer** | API 很干净，接 `source:` + `connectSpeakers:false` 即可 | **3–5 小时 / 80–150 行 JS** | ⚠️ **AGPL-3.0 许可证**（架构层面约束）、95 KB、`connectSpeakers` 配错会双份出声 |
| **butterchurn** | 需要预设包 + 自驱 `render()` 循环 + WebGL 2 降级方案 | **10–15 小时** | 390 KB、全屏 WebGL、移动端 GPU/发热、无优雅降级 |
| **自建（推荐）** | AnalyserNode + Canvas 环形频谱 + CSS 变量驱动样式 + 3D 倾斜 | **6–10 小时 / 250–400 行 JS + 350–550 行 CSS** | 需自己处理 rAF 节流、reduced-motion、双音源单例 |

### ⚠️ 综合风险清单（针对本项目实测数据）

1. **性能 / 卡顿（最高风险）**
   - `assets/music/` **366.7 MB / 38 曲**，平均 9.7 MB，最大 11.9 MB → **wavesurfer 全文件解码不可行于列表级**。
   - `assets/backgrounds/` **87.5 MB / 46 张 jpg** —— 舞台背景轮播本身已经在吃带宽和解码。
   - 项目 CLAUDE.md 记载：曾因给 18+ 元素加 `will-change` 造成 **GPU 层爆炸，是卡顿主因**（已于 2026-05-25 移除）。→ **新 UI 严禁大面积 `will-change`**，且 `body.style-transitioning *` 规则只允许 `color/background-color/border-color/box-shadow` 四个属性，**不得追加 `transform`/`opacity`**。
   - → 可视化必须：`requestAnimationFrame` + 页面不可见时 `cancelAnimationFrame`（`document.visibilityState`）、`AnalyserNode.fftSize` 用 **2048 而非 8192**（Tone/audioMotion 默认值偏高）、Canvas 尺寸按 `devicePixelRatio` 但**上限 2**。

2. **主题系统冲突**
   - 现状：`.music-library` 已有一套**硬编码的暗色 token**（[styles.css:1754-1760](styles.css#L1754-L1760)）：`--music-panel: rgba(10,13,22,.72)`、`--music-text:#fff`、`--music-muted` … 它们**不随 6 套主题变化**。
   - 同时卡片里散落硬编码色：`rgba(41,151,255,…)`、`rgba(130,80,255,…)`（[styles.css:1876-1887](styles.css#L1876-L1887)）、`rgba(255,255,255,0.04)`、`#0a0d18` 等。
   - → 新 UI 必须**补一组语义 token**（见 §5）并让 6 套 `body.design-*` 各自覆盖，否则"高科技"皮肤会像贴上去的补丁。
   - → wavesurfer 的 Shadow DOM 意味着**它的颜色只能由 JS 在主题切换时重设**（`applyStyle()` 里加一个回调），这是新增的耦合点。

3. **许可证**
   - **audioMotion-analyzer = AGPL-3.0**（README + shields 双证）→ 公开站点使用有源码提供义务，**建议放弃**。
   - **GSAP = Webflow 私有"免费"许可**（2025-04-30 生效）→ 个人站免费，但非 OSI 开源、可被单方修订。
   - **p5.js = LGPL-2.1**。
   - **OGL = "not specified"** → 无许可即默认保留全部权利，**不可用**。
   - 真正干净的：wavesurfer.js (BSD-3)、APlayer/howler/tsparticles/mojs/three/butterchurn/curtains (MIT)、原生 API。

4. **移动端**
   - 现有响应式：`body.layout-mobile` 下 `.music-library-body` 变单列、`.music-library-stage` 变 `4/3`、`.music-player-bar` 变纵向（[styles.css:4886-4907](styles.css#L4886-L4907)）；另有 340px 固定左栏（[styles.css:2006](styles.css#L2006)）。
   - → 环形频谱在窄屏要降级为**横向频谱条**；3D 倾斜必须靠 `@media (hover:hover)` 关闭，否则触摸端会误触发。
   - → iOS Safari 需要**首次用户手势**才能启动 `AudioContext`（audioMotion README 明确提到浏览器自动播放策略会把 AudioContext 置于 suspended）。→ 必须在"播放"按钮的点击处理里 `audioCtx.resume()`。

---

## 5. 附录：针对本区块的高科技改造方案（全息甲板 / Holographic Deck）

### 5.1 现状基线（我实测的布局参数）
- `.music-library-body` → `grid-template-columns: 340px 1fr; gap: 20px`（[styles.css:2004-2008](styles.css#L2004-L2008)）
- 左栏 `.music-library-list` → `grid-template-columns: repeat(2, 1fr); gap: 12px`，卡片 16:9 缩略图 + 名称 + 歌曲数 + 图片数
- 右栏 `.music-library-stage` → `aspect-ratio: 1/1`，内含 `#bg-layer-a` / `#bg-layer-b` 两张交叉淡入的图
- 底部 `.music-player-bar` → 玻璃拟态横条（`backdrop-filter: blur(var(--glass-blur-soft))`，[styles.css:2056](styles.css#L2056)）
- 数据规模：**16 个角色 / 38 首曲 / 0.4 MB 缩略图 / 366.7 MB 音频**

### 5.2 目标形态：把"左列表+右大图"改成"全息甲板"

```
┌──────────────────────────────────────────────────────────────┐
│  ◢ 音乐收藏            [频谱环/波形 模式切换]     16 角色 · 38 曲 │  ← 顶部遥测条
├────────────┬─────────────────────────────────────────────────┤
│ ░ 霓虹角色轨 │                                                 │
│            │        ╭───────────────────────╮                  │
│ ▣ 02   4/6 │       ╱   ◜◝◜◝ 环形频谱 ◜◝◜◝    ╲                 │  ← Canvas 环形频谱
│ ▣ akame 4/5│      │    [ 当前角色缩略图 ]      │                │     外圈 = FFT
│ ▣ chitan 2/3│      │    ◟◞ 全息网格叠加 ◟◞     │                │     内圈 = 进度弧
│ ▣ chthol 1/2│       ╲   ▓▓▓ 曲目脉冲柱 ▓▓▓    ╱                  │
│  ⋮         │        ╰───────────────────────╯                  │
│            │        幻影层 · chroma shift · 扫描线               │
├────────────┴─────────────────────────────────────────────────┤
│ ◀◀  ▶  ▶▶   │  ▁▂▃▅▇▅▃▂▁ 波形进度条  │ 01:23 / 04:56  🔈 ▓▓▓░ │  ← 波形式进度条
└──────────────────────────────────────────────────────────────┘
```

**核心变化（4 点）**
1. **左栏 2 列网格 → 单列"霓虹角色轨"**：从 340px 宽的 2×8 卡片阵，变成一条纵向 rail。每项 = 32×32 圆角头像 + 角色名 + `4曲/6图` 等宽字体徽章。**活跃项**用 CSS `conic-gradient` 跑马灯描边（复用现有 `mask-composite` 技法）。好处：卡片高度从 ~150px 降到 ~48px，可视行数从 4 行涨到 14 行，**信息密度反而上升**，观感从"相册"变成"控制台"。
2. **右栏 1:1 舞台 → 全息甲板**：背景图保留（继续用 `#bg-layer-a/b` 交叉淡入），但上面叠加三层：
   - **Canvas 环形频谱**（`position:absolute; inset:0`）：用 `AnalyserNode.getByteFrequencyData()` 画 ~96 根辐射柱，外圈随低频脉动。
   - **进度弧**：`<circle>` + `stroke-dasharray`/`stroke-dashoffset`（项目已在用这个技法，见 [script.js:190](script.js#L190) 的 `muteProgressArc.style.strokeDashoffset`）。
   - **全息网格**：纯 CSS `repeating-linear-gradient` 两层（横+纵）+ `mask-image: radial-gradient()` 做边缘淡出。**零 JS、零开销。**
3. **进度条 → 迷你波形**：不引入 wavesurfer，改用 **CSS `repeating-linear-gradient` 画伪波形**，或对**当前这一首**用 `decodeAudioData` 抽 128 个峰值画进 60px 高的 canvas（**只解码当前曲，且抽完立即释放 buffer**）。
4. **播放栏 → 遥测条**：左侧保留 `#music-library-artist`（[index.html:298](index.html#L298)），时间显示换等宽字体 + 青色发光，音量条换成分段 LED 样式。

### 5.3 用的 CSS 技法（全部零依赖）
| 技法 | 用途 | 备注 |
|---|---|---|
| `mask-composite: exclude` + `linear-gradient` 描边 | 活跃卡片霓虹边框 | **项目已有**：[styles.css:1881-1893](styles.css#L1881-L1893) |
| `conic-gradient` + `@property --angle` 动画 | 跑马灯旋转描边 | Chromium 支持；Firefox 需 fallback 到静态渐变 |
| `repeating-linear-gradient` | 全息网格、扫描线 | 零 JS |
| `backdrop-filter: blur(var(--glass-blur-soft))` | 玻璃面板 | **项目已有**：[styles.css:2056](styles.css#L2056) |
| `aspect-ratio` | 舞台比例 | **项目已有**：[styles.css:2035](styles.css#L2035) |
| `mix-blend-mode: screen` / `plus-lighter` | 全息叠色 | 注意与 `isolation:isolate` 的关系，[styles.css:2040](styles.css#L2040) 已有 `isolation:isolate` |
| `transform: perspective() rotateX() rotateY()` | 卡片 3D 倾斜 | 包在 `@media (hover:hover) and (prefers-reduced-motion:no-preference)` 内 |
| `filter: drop-shadow()` 一次性发光 | 霓虹光晕 | ⚠️ **不要**用大面积 `box-shadow` 动画，那会触发重绘 |

### 5.4 新增的 CSS 语义 token（补齐主题体系）
现状 `.music-library` 只有 5 个硬编码暗色变量（[styles.css:1754-1760](styles.css#L1754-L1760)）。建议扩展为**可被 6 套主题覆盖**的一组：

```css
.music-library {
  /* 已有 */
  --music-panel: rgba(10, 13, 22, 0.72);
  --music-panel-strong: rgba(15, 18, 30, 0.9);
  --music-line: rgba(255, 255, 255, 0.14);
  --music-text: #ffffff;
  --music-muted: rgba(255, 255, 255, 0.68);
  /* 新增：高科技语义层 */
  --music-accent: var(--primary);          /* 跟随主题主色 */
  --music-accent-2: #8250ff;               /* 次级霓虹色（紫） */
  --music-glow: 0 0 24px color-mix(in srgb, var(--music-accent) 45%, transparent);
  --music-grid: rgba(255, 255, 255, 0.05);
  --music-scan: rgba(255, 255, 255, 0.03);
  --music-ring-track: rgba(255, 255, 255, 0.08);
  --music-level: 0;                        /* JS 写入 0..1，驱动脉动 */
}
/* 6 套主题各自微调 */
body.design-spotify .music-library { --music-accent: #1db954; --music-accent-2: #1ed760; }
body.design-linear  .music-library { --music-accent: #5e6ad2; --music-accent-2: #8b93ff; }
body.design-figma   .music-library { --music-accent: #0d99ff; --music-accent-2: #a259ff; }
body.design-notion  .music-library { --music-accent: #2383e2; --music-accent-2: #eb5757; }
body.design-upscayl .music-library { --music-accent: #ff7a45; --music-accent-2: #ffd166; }
```
> ✅ 用 `--music-level` 承载音频能量，**JS 每帧只写 1 个 CSS 变量**（`el.style.setProperty('--music-level', v)`），所有脉动动画由 CSS 消费。这比每帧改 N 个元素样式便宜得多，也符合项目 CLAUDE.md 里"少改属性、让 CSS 并行过渡"的既有思路。

### 5.5 DOM 大致会变成什么

```html
<section id="music-library" class="section music-library">
  <details class="music-library-details">
    <summary class="music-library-head">
      <h2>音乐收藏</h2>
      <!-- 新增：遥测条 -->
      <div class="music-telemetry" aria-hidden="true">
        <span id="music-telemetry-count">16 角色 · 38 曲</span>
        <button id="music-viz-mode" class="music-viz-toggle" type="button">频谱环</button>
      </div>
      <svg class="music-chevron">…</svg>
    </summary>

    <div class="panel-inner">
      <div class="music-library-shell">
        <div class="music-library-body">
          <!-- 左：霓虹角色轨（由 renderTrackList 生成，仍是 <button>，A11y 语义不变） -->
          <div class="music-library-left">
            <div id="music-local-list" class="music-library-list" role="list"></div>
          </div>

          <!-- 右：全息甲板 -->
          <div class="music-library-right">
            <div class="music-library-stage">
              <img id="bg-layer-a" class="bg-layer" alt="" />
              <img id="bg-layer-b" class="bg-layer" alt="" />
              <!-- 新增三层（纯装饰，aria-hidden） -->
              <div class="holo-grid" aria-hidden="true"></div>
              <canvas id="music-spectrum" class="holo-spectrum" aria-hidden="true"></canvas>
              <svg class="holo-progress" viewBox="0 0 100 100" aria-hidden="true">
                <circle class="ring-track" cx="50" cy="50" r="46" />
                <circle id="music-ring-progress" class="ring-progress" cx="50" cy="50" r="46" />
              </svg>
              <!-- 新增：曲目脉冲柱 -->
              <div id="music-pulse-bars" class="holo-bars" aria-hidden="true"></div>
            </div>
          </div>
        </div>

        <div class="music-player-bar"><!-- 保留现有全部 id，仅换皮 -->
          <!-- … 现有 #music-library-artist / #header-music-prev / #music-library-play /
               #header-music-next / #header-image-prev / #header-image-next /
               #music-save-thumb-pos / #music-library-time / #music-library-progress /
               #music-library-mute / #music-library-volume 全部保持不变 … -->
        </div>

        <p id="music-library-source" class="music-track-source"></p>
        <audio id="music-library-audio" preload="metadata"></audio>
      </div>
    </div>
  </details>
</section>
```

**关键设计原则：DOM 是"加法"不是"改写"。** 所有现有 `id`（`#music-library-audio`、`#music-local-list`、`#music-library-progress`、`#music-library-mute`…）**一个都不动**，新增的只有 `aria-hidden="true"` 的装饰层。这样 `script.js` 里 300+ 行既有播放逻辑、`localStorage` 缩略图滚动位置（[script.js:340-368](script.js#L340-L368)）、以及 `launcher/publish/` 那份副本的同步问题，都能降到最低。

### 5.6 可视化接线（~40 行，零依赖）

```js
// 单例：同一 <audio> 只能 createMediaElementSource 一次
const _srcCache = new WeakMap();
let _audioCtx, _analyser, _freqData, _rafId;

function ensureAnalyser(el) {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (!_srcCache.has(el)) {
    const src = _audioCtx.createMediaElementSource(el);
    _analyser = _audioCtx.createAnalyser();
    _analyser.fftSize = 2048;          // 不用 8192：够用且省 CPU
    _analyser.smoothingTimeConstant = 0.8;
    src.connect(_analyser);
    _analyser.connect(_audioCtx.destination);   // ← 必须接回 destination，否则没声音
    _srcCache.set(el, src);
  }
  _audioCtx.resume();                  // iOS：必须在用户手势里
  return _analyser;
}

function loop(stage, analyser, canvas) {
  if (document.visibilityState !== 'visible') { _rafId = null; return; }  // 后台停摆
  if (!_freqData) _freqData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(_freqData);
  const level = _freqData.reduce((a, b) => a + b, 0) / _freqData.length / 255;
  stage.style.setProperty('--music-level', level.toFixed(3));  // 只写 1 个变量
  drawRing(canvas, _freqData);                                  // Canvas 画环
  _rafId = requestAnimationFrame(() => loop(stage, analyser, canvas));
}
```

**⚠️ 三个必须记住的坑**（来源：[MDN createMediaElementSource](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaElementSource) + audioMotion README）：
1. **接线后音频改由 AudioContext 输出** → 必须 `analyser.connect(audioCtx.destination)`，否则**音乐静音**。
2. 同一元素**不能**创建两次 source → 用 `WeakMap` 缓存（本方案已处理）。
3. iOS/Chrome 自动播放策略会让 `AudioContext` 处于 `suspended` → 必须**在播放按钮的点击回调里** `resume()`。

### 5.7 reduced-motion 与性能预算

```css
@media (prefers-reduced-motion: reduce) {
  .holo-grid, .holo-bars, .holo-spectrum { display: none; }   /* 关掉装饰层 */
  .music-role-group { transition: none; }                      /* 保留静态霓虹描边 */
  .holo-progress .ring-progress { transition: none; }          /* 进度弧改为瞬变 */
}
```
```js
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
if (reduceMotion.matches) { /* 不启动 rAF，只按 1Hz 更新进度弧 */ }
```

**性能预算（对齐项目既有约束）**
| 项 | 预算 | 依据 |
|---|---|---|
| 新增 JS 请求 | **0**（推荐方案） | 无新库 |
| 新增 CSS 体积 | ≤ 12 KB（未压缩） | 手写 |
| 新增 rAF 循环 | **1 个**，且不可见时暂停 | 见 5.6 `visibilityState` |
| 每帧 DOM 写入 | **1 次** `setProperty('--music-level')` | 避免逐元素改样式 |
| `will-change` 新增 | **0** | CLAUDE.md 记载：曾因 18+ 元素加 `will-change` 导致 GPU 层爆炸 |
| `body.style-transitioning *` 可过渡属性 | 维持 **4 个**，不加 `transform`/`opacity` | 同上 |
| AnalyserNode.fftSize | **2048** | 8192 是 Tone/audioMotion 的默认，对本场景过重 |
| Canvas DPR 上限 | **2** | 4K 屏上 3x DPR 会让像素量翻 2.25 倍 |

### 5.8 落地顺序建议（分 3 步，每步都可独立验收）
1. **第 1 步（2–3h，纯 CSS）**：只改视觉——左栏变单列霓虹轨、舞台加全息网格与扫描线、播放栏换皮、补齐 `--music-accent` 语义 token 并让 6 套主题覆盖。**不碰 JS。** 这一步就能解决"看起来老套"的 80%。
2. **第 2 步（2–3h，~40 行 JS）**：接 `AnalyserNode` + Canvas 环形频谱 + `--music-level` 脉动 + 进度弧。加入 reduced-motion 与后台暂停。
3. **第 3 步（2–4h，可选）**：3D 倾斜、当前曲目迷你波形、模式切换（频谱环 / 频谱条 / 极简）。

> **总计：6–10 小时，300–450 行代码，零新依赖，零许可证风险，零模块系统要求。**

---

## 6. 一句话结论

**你不需要引入任何播放器库。** 真正的"新颖高科技"来自**布局语言与动效**（第 5 节，纯 CSS + 40 行原生 JS 就能做到），而不是来自某个 JS 库；而唯一同时满足「UMD 可直接 `<script>` 引入 + 活跃维护（2026-10-05）+ 可商用许可（BSD-3-Clause）」的库是 **wavesurfer.js v8.0.1**，建议**只把它当波形组件按需懒加载**，并注意它对大文件全量解码的内存代价（你的单曲最大 11.9 MB）。**务必避开 audioMotion-analyzer（AGPL-3.0）**。

---

## 7. 顺带发现：删除页脚按钮的连带改动点

你已决定删除「前往音乐收藏与播放设置」按钮。我顺手确认了它的完整牵连（**不属于本次调研范围，仅作提醒**）：

- HTML：[index.html:449-452](index.html#L449-L452) —— 整个 `<fieldset class="settings-group">` 里只有这一个 `<a>`，删掉后 `<fieldset>` 与 `<legend id="music-settings-label">音乐</legend>`、以及 `launcher/publish/index.html` 的对应副本（约 424 行）都需要一并处理，否则会留下一个空分组。
- JS：[script.js:272](script.js#L272) 有一行多语言赋值 —— `setText("#music-settings-link", safe==="en" ? "Music collection & playback settings" : "前往音乐收藏与播放设置")`。元素删除后这行会变成对 `null` 的空操作（`setText` 内部有守卫，不会报错），但**建议一并删除**以免留下死代码。
- 同一份副本存在于 `launcher/publish/script.js` 与 `launcher/publish/index.html`，**两处都要改**，否则发布目录与源码会漂移。

