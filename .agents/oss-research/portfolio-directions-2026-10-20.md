# 更精致的深色个人主页方向

查询日期：2026-10-20。当前原生 HTML/CSS/JS 站点保留中文、Apple、看板娘、音乐和项目。此轮只实现删除手动视图切换、自动响应式；视觉候选为调研推荐，未替换用户当前三种主题。

## 推荐

优先 vCard：原生技术栈一致，炭黑、金色强调、固定侧栏和作品卡片符合个人主页。若需要更鲜明的视觉效果，可参考 Magic UI 的开源卡片光效，不整体迁移 React。Brittany v4 作为克制的深蓝薄荷绿备选。

| 项目 | Star | 维护 / 发布 / 归档 | 许可证 | 技术栈与部署 | 可参考部分 | 适配与成本 | 风险 |
| --- | ---: | --- | --- | --- | --- | --- | --- |
| [vCard](https://github.com/codewithsadee/vcard-personal-portfolio) | 8,145 | main 为 master；最近提交 2025-06-12 仅 README；配色 CSS 最近实质修改 2022-03-19（e583e9b1），不能用 README 日期代替；无已发布 Release；未归档 | [MIT](https://github.com/codewithsadee/vcard-personal-portfolio/blob/master/LICENSE) | HTML/CSS/JS，静态部署，低难度 | 原生深色卡片、金色图标、作品区和个人侧栏 | 参考设计并适配现有卡片、音乐、看板娘，低至中成本；不能称为完整零改造套用 | 维护较慢；不复制示例头像、身份和作品内容 |
| [Magic UI](https://github.com/magicuidesign/magicui) | 22,748 | 最新实质修复 2026-10-17：ripple button 清理；无已发布 Release；未归档 | [MIT](https://github.com/magicuidesign/magicui/blob/main/LICENSE.md) | React/Next.js、Tailwind、Motion 组件；原版需构建 | 开源 Magic Card、Bento、细微光效与深色演示 | CSS/现有 Motion 转写部分视觉效果，中成本；当前站点无法直接嵌入 React 组件 | 不引入整套框架；付费 Pro 模板不在本次开源复用范围；动效规模需控制并实测 |
| [Brittany v4](https://github.com/bchiang7/v4) | 8,285 | 最新实质代码提交 2023-04-25；无已发布 Release；未归档 | [MIT](https://github.com/bchiang7/v4/blob/main/LICENSE) | Gatsby/React，原版需 Node 构建 | 深蓝、薄荷绿、阅读层级与项目布局 | 仅参考布局与配色为低至中成本；迁移整站不推荐 | 旧版构建依赖；README 要求署名时应尊重，不复制作者个人资料 |

以上成本是只适配当前页面的相对估算，不含后端或框架迁移。现有 CSS 与本地 Motion 已能覆盖所需视觉基础，不必新增依赖。

## 主要证据与演示

- [vCard README](https://github.com/codewithsadee/vcard-personal-portfolio/blob/master/README.md)、[配色变量](https://github.com/codewithsadee/vcard-personal-portfolio/blob/master/assets/css/style.css)、[演示](https://codewithsadee.github.io/vcard-personal-portfolio/)。
- [Magic UI 文档](https://magicui.design/docs)、[开源仓库](https://github.com/magicuidesign/magicui)、[Magic Card](https://magicui.design/docs/components/magic-card)。
- [Brittany v4 README](https://github.com/bchiang7/v4/blob/main/README.md)、[演示](https://v4.brittanychiang.com/)。

选定视觉方向后的最小验证：保持现有功能，检查手机与桌面、中文文字对比、鼠标与键盘、减少动画；通过性能与截图检查后再替换当前主题。
