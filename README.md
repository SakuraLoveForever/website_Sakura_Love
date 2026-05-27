# 🌸 Sakura_Love — 个人主页

一个融合了绚丽背景、曼妙 BGM 与 Live2D 角色的个人展示站点。

## ✨ 特性

- **5 种设计风格** — 一键切换 Apple / Linear / Spotify / Figma / Notion 主题，带平滑过渡动画
- **粒子动画** — 动态 Canvas 粒子背景
- **Live2D 角色** — 可交互的 Live2D 看板娘（草莓兔兔、Mao、Hiyori、Haru、Natori、Mark）
- **背景画廊** — 多角色背景图切换，支持轮播模式
- **音乐播放** — 内置音乐模块，支持音量/进度控制
- **响应式布局** — 适配桌面端与移动端
- **多语言** — 中 / 英 / 日 三语切换

## 🚀 访问

[https://sakuraloveforever.github.io/website_Sakura_Love/](https://sakuraloveforever.github.io/website_Sakura_Love/)

## 🛠 技术栈

- 原生 HTML / CSS / JavaScript
- Canvas 粒子系统
- Live2D Cubism SDK (WebGL)
- CSS View Transitions API (风格切换动画)
- GitHub Pages 部署

## 🏗 项目结构

```
├── index.html          # 主页面
├── styles.css          # 全局样式 + 5 套设计主题
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

浏览器访问 `http://localhost:8081`。

> 命令行参数 `launcher` 可开启桌面启动器视图。

## ⭐ Star History

<a href="https://www.star-history.com/?repos=SakuraLoveForever%2Fwebsite_Sakura_Love&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=SakuraLoveForever/website_Sakura_Love&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=SakuraLoveForever/website_Sakura_Love&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=SakuraLoveForever/website_Sakura_Love&type=date&legend=top-left" />
 </picture>
</a>
