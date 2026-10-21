# 深色主题替换调研与采用记录

核验日期：2026-10-20（Asia/Shanghai）。范围仅为现有 HTML/CSS/JS 个人主页的主题；保留 Apple、项目、音乐、看板娘和本地启动器。删除 shadcn/ui 浅色与 Tailwind Blog 暖白版本，不引入 Astro 运行时或新 npm 依赖。

用户要求两个候选，因此不补第三个。采用方式均为**参考设计并适配现有 CSS**，不是完整部署模板，也不是直接替换网站框架。

| 仓库 | 本次 Star | 维护与发布 | 许可证 | 技术栈 / 原生部署 | 复用与二次开发 | 成本 / 风险 |
| --- | ---: | --- | --- | --- | --- | --- |
| [saicaca/fuwari](https://github.com/saicaca/fuwari) | 5,091 | 未归档；最新 main 提交为 2025-12-11 依赖机器人更新；所查配色文件最后变更 2025-08-24；未找到已发布 Release。仓库 pushed_at 2026-03-10 不等于主分支实质代码维护。 | [MIT](https://github.com/saicaca/fuwari/blob/main/LICENSE) | Astro、Tailwind CSS、Svelte；原版需 Node/pnpm 构建静态站。 | 参考原生暗色背景、抬升卡片、可配置色相与圆角；适配侧栏、作品卡片、音乐与看板娘面板。本站选柔和蓝色，不提供亮色分支。 | 仅 CSS 适配为低成本；主分支维护较慢，不接入其依赖，避免继承构建和升级负担。 |
| [satnaing/astro-paper](https://github.com/satnaing/astro-paper) | 5,135 | 未归档；最新 main 实质修复 2026-08-05：跳转内容后的焦点管理（35cfa7fb）；最新 Release v6.1.0，2026-06-06。仓库 pushed_at 2026-10-18 不当作代码维护日期。 | [MIT](https://github.com/satnaing/astro-paper/blob/main/LICENSE) | Astro、Tailwind CSS、TypeScript；原版需 pnpm 构建静态站。 | 参考深蓝背景、橙色强调、克制的阅读排版和等宽标题；转换为当前组件的颜色变量与版式。橙色稍提亮，按钮采用深色文字保证对比。 | 仅 CSS 适配为低成本；不复制文章、图片或站点标识，不迁移内容系统。 |

优先推荐 AstroPaper：维护记录较新，简洁阅读排版符合紧凑个人主页。Fuwari 作为更柔和、偏卡片与二次元气质的第二种选择。

来源代码与文档：

- [Fuwari README](https://github.com/saicaca/fuwari/blob/main/README.md)：原生暗色模式、响应式、主题色与 banner 配置。
- [Fuwari 深色配色变量](https://github.com/saicaca/fuwari/blob/main/src/styles/variables.styl)：暗色 page/card/bg/button 等颜色层次。
- [Fuwari 配色文件历史](https://github.com/saicaca/fuwari/commits/main/src/styles/variables.styl)。
- [AstroPaper README](https://github.com/satnaing/astro-paper/blob/main/README.md)：个人博客定位、响应式、无障碍与暗色模式。
- [AstroPaper 深色变量](https://github.com/satnaing/astro-paper/blob/main/src/styles/theme.css)：背景 #212737、文字 #eaedf3、橙色 accent。
- [AstroPaper Release](https://github.com/satnaing/astro-paper/releases/tag/v6.1.0)。

成本判断只涵盖颜色、现有组件适配和验证，不包含迁移 Astro。实际采用不增加服务、服务器或外部接口成本。上游许可证副本保存在 `assets/vendor/DARK-THEME-LICENSES.md`。

最小验证：三个主题切换与刷新保留、旧亮色设置回退 Apple、所有主题首屏和控件均保持 dark、354px 至桌面无溢出、页脚社交链接与跳转按钮不重叠。截图检查主页、项目、音乐和页脚。
