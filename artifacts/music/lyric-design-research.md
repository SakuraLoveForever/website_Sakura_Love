# 轻巧歌词显示与窗口自适应

核验日期：2026-10-22。项目为原生 HTML/CSS/JavaScript，保留现有音频、角色分组、在线解析、歌词解析及点击跳转。本次只参考交互与排版，不引入完整播放器框架。

推荐：APlayer 的紧凑歌词与上下渐隐，加上 YesPlayMusic 的低对比非当前句和柔和焦点过渡。保留已有 lrc-file-parser；使用本地 CSS 和原生滚动实现，适配成本低。AMLL 作为精细动效参考，本次需求不需要其逐词系统。

| 项目 | Star / 核验日期 | 代码维护 / 最新 GitHub Release | 许可证 | 技术栈与集成 | 可参考能力 | 本站适配点 | 成本估计 | 主要限制 |
|---|---|---|---|---|---|---|---|---|
| [APlayer](https://github.com/DIYgod/APlayer) | 7,695 / 2026-10-22 | src：2020-05-23；v1.10.1：2018-03-29 | [MIT](https://github.com/DIYgod/APlayer/blob/master/LICENSE) | JS / SCSS；可嵌入，但本次只参考设计 | [小字号、三行歌词、上下渐隐与透明度层级](https://github.com/DIYgod/APlayer/blob/master/src/css/index.scss) | 双语行高、动态首尾留白、主题色 | 低 | 核心代码较久未更新；整库替换会影响既有频谱和角色联动 |
| [YesPlayMusic](https://github.com/qier222/YesPlayMusic) | 33,424 / 2026-10-22 | 歌词页面：2026-10-10；v0.4.11：2026-10-10 | [MIT](https://github.com/qier222/YesPlayMusic/blob/master/LICENSE) | Vue / Electron；本站只参考设计 | [当前句透明度、轻微缩放、柔和过渡、隐藏滚动条](https://github.com/qier222/YesPlayMusic/blob/master/src/views/lyrics.vue) | 缩小为嵌入式歌词区，使用原生 DOM | 低（设计参考）；整合高 | 完整应用带来框架、音源服务与账户等额外接入；README 说明当前版本进入维护模式 |
| [Apple Music-like Lyrics](https://github.com/amll-dev/applemusic-like-lyrics) | 2,176 / 2026-10-22 | core：2026-10-21；播放器开发 Release main-player-dev：2026-03-27（不代表歌词库版本） | [AGPL-3.0-only](https://github.com/amll-dev/applemusic-like-lyrics/blob/main/packages/core/package.json) | TS / 原生 DOM，含 React/Vue 绑定；本次未集成 | 逐词歌词、精细运动和背景组件 | 本需求仅需逐句，适合参考聚焦感 | 中至高（若整合） | 逐词效果需要对应时间数据，依赖和许可义务更复杂；README 提示仅一位活跃维护者 |

三个仓库本次查询均未归档。Star 是关注度参考，不作为适配性保证。维护日期取对应实质源码路径，非仓库 push 时间；发布日期取 GitHub Release，不推断 npm 发版时间。

本站实现：取消 1280px 固定画布；默认侧栏随窗口收放并尊重手动偏好，音乐双栏与控制条自然重排。歌词面板改为约 144px 的轻背景布局，原文 13px、译文 10.5px；焦点以透明度及轻微缩放表达，首尾按实际行高补充留白。支持减少动态效果，保留按钮键盘访问和焦点指示。

验证：检查 354–1920px 页面宽度、不同行主题及启动器；模拟真实音频进度，核验高亮、点击跳转、首尾居中、快速切歌及音源失败回退。成本为当前页面样式与有限同步代码的低成本适配估计，不含音源平台或云服务变更。

2026-10-23 侧栏补充（按用户纠正更新）：核验 [FlClash v0.9.1 的侧栏源码](https://github.com/chen08209/FlClash/blob/v0.9.1/lib/ui/sidebar.dart)和 [Flutter 曲线定义](https://github.com/flutter/flutter/blob/master/packages/flutter/lib/src/animation/curves.dart)。FlClash 原版为 320ms，领先端在前 60% 内到达，尾端从 35% 开始收拢，二者存在重叠；使用 easeOutCubic / easeInOutCubic，实际是贝塞尔曲线，并非三次多项式近似。

本站遵循用户明确要求的“先完全连接，再从原条目收走”：0–360ms 保持原端不动并伸到目标；360–420ms 完整连接；420–600ms 从原端收拢，目标端不动。浏览器 Web Animations API 使用原版两条贝塞尔曲线 (.215,.61,.355,1) / (.645,.045,.355,1)。上下双向相同；打断后从当前可见端点继续，减少动态效果时立即定位。这里保留用户此前要求的较慢时长，并把重叠改成严格先后阶段，因此不宣称与原版参数完全相同。仅参考交互设计与公开曲线参数，未引入 Flutter 或复制该项目组件；原仓库为 [GPL-3.0](https://github.com/chen08209/FlClash/blob/main/LICENSE)。脚本与样式版本号同时更新。

回归断言直接检查浏览器绘制几何：目标端到达前原端不动、存在持续的完整连接、随后固定目标端收走原端、最终恢复 16px；覆盖上下切换、途中反向、键盘、布局变化和减少动态效果。
