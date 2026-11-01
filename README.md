# 🌸 Sakura_Love — 个人主页

一个融合了绚丽背景、曼妙 BGM 与 Live2D 角色的个人展示站点。

## ✨ 特性

- **6 种设计风格** — 默认 Upscayl，也可切换 Apple / Linear / Spotify / Figma / Notion 主题，带平滑过渡动画
- **粒子动画** — 动态 Canvas 粒子背景，页面设置中可调节粒子粗细、暂停或恢复运动
- **Live2D 角色** — 可交互的 Live2D 看板娘（草莓兔兔、设计天才·白、Mao、Hiyori、雷姆、拉姆、艾米利亚）
- **背景画廊** — 多角色背景图切换，支持轮播模式
- **音乐播放** — 本地服务优先播放原曲的在线版本，支持双语逐句歌词滚动、点击歌词跳转和本地音频回退
- **自适应布局** — 使用统一页面，随窗口收放侧栏、音乐区和项目栅格，无固定 1280px 最小宽度；窄窗口自动收起侧栏，手动偏好会保留
- **多语言** — 中 / 英 / 日 三语切换

## 🚀 访问

[https://sakuraloveforever.github.io/website_Sakura_Love/](https://sakuraloveforever.github.io/website_Sakura_Love/)

## 🛠 技术栈

- 原生 HTML / CSS / JavaScript
- Canvas 粒子系统
- Live2D Cubism SDK (WebGL)
- CSS View Transitions API (风格切换动画)
- GitHub Pages 部署

粒子网络基于 Julian Laval 的 [canvas-particle-network](https://github.com/JulianLaval/canvas-particle-network)（MIT 许可），本站对线条粗细、交互和运动控制做了适配。

## 🏗 项目结构

```
├── index.html          # 主页面
├── styles.css          # 全局样式 + 6 套设计主题
├── script.js           # 核心逻辑（风格切换 / Live2D / 音乐 / 背景）
├── particle-network.min.js  # 粒子动画
├── server.js           # 本地开发服务器
├── assets/             # 静态资源（图片 / 音频 / Live2D 模型）
├── live2d-widget-v3-main/  # Live2D 组件
└── launcher/           # 桌面启动器
```

## 📦 本地运行

```bash
npm start
```

浏览器访问 `http://localhost:8000`。

> 命令行参数 `launcher` 可开启桌面启动器视图。

### 在线音乐与歌词

在线解析需通过 `npm start` 启动的 Node.js 服务（Node.js 20+）。曲目清单在 `assets/music/catalog.json`，保留全部 38 个原始音频及角色分组，按歌曲、歌手、专辑与时长匹配在线版本。`02/3.mp3` 为未匹配到的剪辑版本，继续使用本地音频。

本地端点 `GET /api/music/track?id=歌曲ID` 仅解析清单内的网易云歌曲，获取公开可用的完整音频链接和原文/翻译歌词，不使用账号 Cookie；试听、受限或失败的音源回退原 MP3。链接按有效期缓存，不写入曲目清单。2026-10-22 查询时，25 个去重后的在线曲目中有 14 个返回完整音频链接；这不是永久可播放承诺，音源可用性会变化。

歌词复用 [lrc-file-parser](https://github.com/lyswhut/lrc-file-parser)，MIT 许可。仓库内固定版本为 v2.4.0 的构建产物，来源提交 `8927b9c58a0b52b58715ced781c760adcbb05739`；许可保留在 `assets/vendor/lrc-file-parser.LICENSE`。页面使用音频的真实进度同步歌词，兼容冒号毫秒时间标签、偏移、多时间标签及翻译；本地回退时只为匹配时长差在 3 秒内的版本使用对应歌词。该时长检查不能替代逐首听感校准。

直接双击 HTML、GitHub Pages 和现有 .NET 启动器不运行 Node.js 音源接口，会保留本地播放。现阶段未部署在线服务，也未删除 MP3。

## ⭐ Star History

<a href="https://www.star-history.com/?repos=SakuraLoveForever%2Fwebsite_Sakura_Love&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=SakuraLoveForever/website_Sakura_Love&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=SakuraLoveForever/website_Sakura_Love&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=SakuraLoveForever/website_Sakura_Love&type=date&legend=top-left" />
 </picture>
</a>
