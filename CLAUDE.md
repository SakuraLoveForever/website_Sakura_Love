# CLAUDE.md — website_Sakura_Love

## Style switching (theme/design) — do not regress

The site supports 3 design styles (apple/shadcn/tailwind) switchable at runtime. Apple is the default; retired or invalid saved styles fall back to Apple. New theme overrides are in `themes.css`, inspired by shadcn-ui/ui and timlrx/tailwind-nextjs-starter-blog. Switching must be smooth — no frame drops, no stutter.

### Two-path architecture

```
applyStyleSmooth(style)
  ├─ prefers-reduced-motion → applyStyle() directly, skip animation
  ├─ document.startViewTransition (Chromium) → View Transitions API crossfade
  └─ fallback (Firefox/Safari) → CSS transition class toggling
```

### JS (script.js)

- `applyStyle(k)` — atomic class swap via `classList.replace(oldClass, newClass)`, toggles `theme-dark`, then calls `syncRootThemeTokens`
- `syncRootThemeTokens(safe)` — sets `backgroundColor`, `color`, `colorScheme` on `:root` (html element). **Do NOT set `--canvas` or `--text` here** — those are defined by `body.design-*` CSS classes, and inline settings on `:root` are either dead (overridden by body) or cause redundant style recalc. Removed 2026-05-25.
- `syncRootThemeTokens` is called AFTER the class swap, so the CSS body class provides the custom property values first, then the html root element gets its background/text color.
- `applyStyleSmooth(style, afterApply)` — picks the right animation path
  - View Transitions path: wraps `applyStyle()` + `afterApply()` inside `document.startViewTransition(callback)`
  - CSS fallback: adds `style-transitioning` class, then `requestAnimationFrame(() => { applyStyle(); afterApply(); endStyleTransition() })`
- `beginStyleTransition()` / `endStyleTransition()` — adds/removes `style-transitioning` on `<body>`, auto-cleans after 440ms

### CSS (styles.css)

- `body.style-transitioning *` — 320ms transitions on `color, background-color, border-color, box-shadow` only. **Do NOT add `transform` or `opacity`** to this list.
- **Do NOT add `will-change` to `body.style-transitioning` elements.** Past attempt to add `will-change: transform, opacity` to 18+ sections (header, hero, cards, panels, footer, etc.) caused heavy GPU layer allocation that was the primary source of stutter. Removed 2026-05-25.
- View transition animations: 400ms `cubic-bezier(0.4, 0, 0.2, 1)` fade-out/fade-in keyframes (not browser default 200ms crossfade — too abrupt).
- `.notransition` class — suppresses all transitions/animations, used as escape hatch.

### Why this works

- View Transitions API takes a screenshot before and after, animates between them — zero layout cost.
- CSS fallback only transitions 4 cheap properties (color, bg, border, shadow) — no layout triggers.
- `classList.replace()` is one DOM mutation instead of add+remove — the browser sees one style change, not two.
- Custom properties on `:root` change once, then all descendants transition in parallel via the `*` rule.

### Cold-start compositor warmup (2026-05-25)

After page load, the browser's GPU compositor is cold — no transition infrastructure, no composited layers cached. The first style switch forces the browser to set up transition tracking AND create GPU layers AND animate simultaneously, causing stutter. Subsequent switches are smooth because everything stays warm.

Fix: after initial `applyStyle()` on page load, do a throwaway `style-transitioning` toggle (add class → double-rAF → remove class). This forces the browser to pre-build transition pipelines and warm the compositor. The user never sees it because no properties actually change during the warmup.

```js
const _warmupCompositor = () => {
  if (!document.body.classList.contains("style-transitioning")) {
    document.body.classList.add("style-transitioning");
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.body.classList.remove("style-transitioning");
    }));
  }
};
setTimeout(_warmupCompositor, 600);
window.addEventListener("load", () => setTimeout(_warmupCompositor, 400), { once: true });
```

Both `setTimeout` (catches early-ready pages) and `load` event (catches resource-heavy pages) — only one will fire since the guard prevents double-warmup.

## 项目展示 = 分类作品集（2026-10-06，用户确认替换 bento）

采用一张横向精选卡 + 三列常规项目网格，平板两列、手机单列。
分类按钮使用原生 button + aria-pressed；筛选只设置 hidden，不增删或重排 DOM。
保留 .project-grid / .card / .project-title-btn，每张卡仅有一个正文 p。
script.js 的标题、描述和 aria-label 数组仍按 DOM 索引对应十二个项目。

- 六张封面来自站长自己的项目截图，来源见 assets/projects/README.md。
- 没有截图的项目显示明确的工具代号，不伪造截图。
- 描述最多两行，精选卡桌面高度 280px，取消跨行 bento 和强行补满网格。
- 所有项目标题和封面使用真实 href，筛选后仍能直接进入项目。
- hidden 必须显式 display:none，防止主题的 display:flex 覆盖。
- reduced-motion、移动端不溢出和中英索引契约继续验证。
- tests/projects-bento.spec.js 保留文件名，但内容已更新为分类作品集契约。
- tests/portfolio-controls.spec.js 覆盖分类、截图、视口、角色切换和尺寸快捷操作。

## Interaction invariants (2026-10-06) — do not regress

These four behaviours were buggy and are now covered by `tests/fixes-2026-10.spec.js`.

### 看板娘眼神跟随 — 水平方向以角色位置为原点

`setManualFocusFromEvent` (script.js, inside `initLive2d`) uses the mascot's visual center
as the horizontal origin. Normalize each side by its available distance to the viewport
edge, so a pointer to the character's right always produces positive `nx`, including
the left half of the screen. Read position and scale on each pointer event to support
dragging and resizing. Vertical normalization remains relative to the viewport.
Do not restore a viewport-centered horizontal origin or a fixed ±202px divisor.

- Write magnitudes come from `coreModel.getParameterMinimumValue/MaximumValue` (`live2dFocusRange`),
  not hardcoded `±42 / ±52`. The `tutu` model's `ParamAngleX` range is `±30`, so the old values
  were permanently clamped.
- `manualFocusPoint` is the **eased** value (0.18/frame), `manualFocusTarget` is the pointer target.
  When the ticker is stopped (reduced motion / mobile) `applyManualFocus(true)` snaps instead.
- `setFocusedParameter(..., fallbackRange)` still writes the model-private `Param83/84`（摇杆x/y）;
  they are not eye params and do not exist on every model.

### 水印极性 — `Param261` 的 1 = 隐藏，**不要改成 0**

Verified by screenshot A/B on `tutu`: `Param261 = 1` hides the watermark, `0` renders the full
"试用版 / Trial Version / Sold in Bilibili Workshop and BOOTH ONLY" overlay. The bundled
`expressions/水印.exp3.json` sets `1.0` and reads like "show the watermark", which is exactly the
wrong conclusion — trust the runtime, not the expression file.

The old `Ctrl+Shift+<any key>` hotkey was **removed on purpose**: it fired on Ctrl+Shift alone, so
opening DevTools (`Ctrl+Shift+I/C/J`) permanently revealed the trial watermark until reload.

Hiding the underlying parts (`Part34` / `Part35`) does **not** remove the watermark — verified: with
both at opacity 0 the trial text is still drawn. `Param261` is the only lever.

**Enforcement timing (2026-10-07).** Motions can overwrite parameters inside
`internalModel.update()`, so writing before that method is insufficient. The target-specific
guard wraps `coreModel.update()` and applies `Param261 = 1` immediately before Cubism calculates
drawable pixels. After the internal update restores its saved parameters, a second write keeps
the externally readable state at 1. The renderer wrapper only maintains parameter state;
it recalculates the core model when the watermark parameter has drifted, so paused/render-only
paths also remove already-calculated watermark pixels. Switching models performs one guarded
core update before the character's first render.

`tests/refinement.spec.js` simulates animation resetting this parameter and verifies both the
Cubism draw boundary and actual canvas pixels using a watermark-only alpha mask.

Covered by the regression test「看板娘水印在停帧（减少动画）时也会被强制压回」: it forces the param
to 0, runs one real model frame, and expects 1 — with the assertion that the ticker really is stopped.

### 紧凑排版与交互动效（2026-10-07，用户审核通过）

五个新增截图已上传到对应仓库的 `docs/images` 并添加 README 展示：Kindle、电脑守护精灵、YouTube 取消点赞、AutoClean、GitHub 个人主页。网站采用 `assets/projects/*-preview.png` 原图，目前 12 张卡中 11 张使用截图。Kindle 在线地址使用仓库原名 `kindle_notes_exporter`（下划线）。

- 参考 shadcn/ui 的控件密度和 Tailwind Nextjs Starter Blog 的内容层级；保留原生技术栈。
- Motion 14.0.0 固定版本本地存于 `assets/vendor`，MIT 许可证随文件保存。
- Motion 只控制项目卡片 body 和设置面板的淡入；卡片外层 reveal/tilt 继续由 CSS 控制。
- 卡片指针效果每帧最多更新一次，减少动画时跳过 Motion 和倾斜。
- 看板娘点击在 document 捕获阶段优先命中不透明像素；透明区域继续点击穿透。
- 眼神跟随必须在 `coreModel.update()` 绘制前应用，避免被模型动画覆盖；停帧时指针事件通过 rAF 合并一次实际更新与重绘。`tests/refinement.spec.js` 验证眼球参数在绘制时的左右/上下方向，包含减少动画模式。
- 调整尺寸时 `renderer.resize()` 会清空画布；`layout()` 必须在更新模型缩放和位置后立即重绘，不能依赖动画 ticker。`tests/live2d-resize.spec.js` 逐帧读取画布，验证滑块和大小按钮在正常/减少动画模式下均不产生空白帧。
- 桌面侧栏 216px，页脚采用两列轻量分组，手机为一列；移动端控件保留 44px 点击高度。
- Upscayl 使用蓝灰背景 `#3c5369`，面板 `#425b72`，强调色 `#bedff2`，去除独立黑色 UI 色块。修改配色时同时维护 index.html 的首帧 bgMap 与 script.js 的 rootThemeTokens，避免加载或切换时闪黑。

### 看板娘尺寸 — 点击一次到面板 + 可拖拽手柄（2026-10-06）

需求「点击后要能调整大小」。原交互要两次点击：点本体 → 弹出小把手（3.6s 后自动消失）→
再点把手才开面板。现在：

- **点本体直接 `setLive2dSettingsOpen(true)`**（一次点击到尺寸滑块），同时保留对话与 TapBody。
- `#live2d-resize-handle`：右下角圆形手柄，与设置把手同一套显隐规则（点过看板娘才出现）。
  尺寸按 **指针到看板娘左边缘的距离 ÷ 基准宽度** 换算，不用位移量 —— 看板娘底部锚定时
  （默认 `bottom:0`）长高会让上边缘上移，用位移量会出现「往下拖反而变小」。
- 手柄必须排除在 `beginLive2dDrag` 之外（`isLive2dSettingsTarget` 里已加它），
  否则拖手柄会同时触发看板娘的拖拽移动。`pointerdown` 里要 `preventDefault()`
  并 `setPointerCapture`，CSS 要 `touch-action: none`（否则移动端会被当成页面滚动手势）。
- 键盘可达：方向键 ±5%，`aria-label` 跟随中英切换（复用 `copy.adjustLive2dSize`）。
- 归一化与持久化复用 `setLive2dSizePercent`，与面板滑块完全同一条路径。

**`#live2d-size` 的 `step` 必须是 1。** 曾经的 bug：step=5 时，
`normalizeLive2dSizePercent` 把尺寸夹到视口上限（1280×720 下是 **124**，不是 5 的倍数），
而 range 输入会把 `.value` 吸附到步进网格 → **滑块显示 125、实际尺寸 124、标签写 124%**，
三者不一致。改成 step=1 后滑块 / `localStorage.live2dSize` / `--live2d-size` / 标签永远说同一个数。
由「滑块、持久化值、实际尺寸三者始终一致」这条测试锁定。



### 粒子光标连线 — canvas 是 `pointer-events: none`，不能在 canvas 上监听

`#particle-canvas` must stay `pointer-events: none` (click-through is asserted by
`tests/audit-fixes.spec.js`), which means the library's own `canvas.addEventListener('mousemove')`
**never fires**. `interactive: true` alone therefore does nothing visible.

The working recipe (script.js particle IIFE):

1. `interactive: true` — upstream then pushes a `velocity = 0` "mouse particle" (`network.p`) into
   the particle array, so the existing 120px all-pairs link loop connects it to nearby particles.
2. Drive `network.p.x/y` from a **window-level** `pointermove`, converting client coords with the
   canvas `getBoundingClientRect()`. Park it at `-9999` on `pointerleave` / `blur` so links do not
   stick to the last position (upstream has no `mouseleave`).
3. `syncParticleRuntime` must **skip** the anchor when randomizing velocities — otherwise the anchor
   drifts off the cursor and the links visibly float away.
4. Paused still means frozen: no redraw on pointermove, so
   `tests/audit-fixes.spec.js`「暂停粒子后鼠标不会重绘」stays valid.

### 粒子运动「默认开启」（2026-10-06）

`motionEnabled` must default to **true**. The old default keyed off `prefers-reduced-motion` and a
stored flag, so a machine with「减少动画」on — or one stale `particleMotionEnabled=false` from an
earlier pause — left the particles permanently frozen, looking like a broken effect.

Migration contract: `PARTICLE_MOTION_VERSION = '2'` + `localStorage.particleMotionVersion`. If the
stored version is missing/older, force motion on and rewrite the flag; from then on an explicit user
pause *is* remembered (`tests/homepage.spec.js` asserts the pause survives a reload).
`tests/audit-fixes.spec.js` must therefore pause by actually clicking the toggle, not via
`emulateMedia({ reducedMotion: 'reduce' })`.

### 看板娘拖拽 = 整块面板，点击 = 像素精确

Pixel-accurate hit testing is **not** enough for dragging: the character only covers a small part of
its 280×560 panel (measured: 9 of 18 grab points missed, so it felt「拖不动」). The split is:

- **Drag** (`beginLive2dDrag`): starts whenever the pointer is inside the canvas box
  (`isInsideLive2dBox`) — no pixel extraction at all, which also removes a per-pointerdown
  `extract.pixels` of the whole stage.
- **Click** (`hitLive2dPixel` → dialog / settings button / TapBody): stays pixel-accurate, so
  clicking empty panel space falls through to the page instead of popping the mascot dialog.

Two rules keep this safe:

1. `beginLive2dDrag` must **not** call `preventDefault()` — at pointerdown we don't yet know whether
   it's a drag or a click, and preventing it would break links/buttons underneath the panel.
   `preventDefault()` happens in `handleLive2dDragMove` only after the 3px threshold.
2. After a real drag, a **one-shot capture-phase `click` listener** swallows that click — otherwise
   releasing the drag over a link would navigate.

`tests/live2d-toggle.spec.js` asserts exactly this contract: a pointerdown on a transparent pixel
gives `{ prevented: false, dragging: true }`.

### `extract.pixels()` 坐标陷阱（曾让拖拽完全失效）

`app.renderer.extract.pixels(target)` **without a frame returns only the target's bounding box**
(measured 258×451 for the mascot) while the canvas is 280×560 — indexing it with renderer dimensions
reads out of range and the hit test degrades to noise. Always pass an explicit full-canvas frame and
derive the scale from the returned length:

```js
const pixels = app.renderer.extract.pixels(app.stage, new PIXI.Rectangle(0, 0, rect.width, rect.height));
const scale = Math.sqrt(pixels.length / 4 / (rect.width * rect.height));
```

### 语录浮层 — 存活 1s，半透明，测试用 MutationObserver 测量

Use `width: max-content` with a viewport-limited max width. Measure the bubble before
clamping its center X and top Y in `showClickText`; positioning by the click alone
causes right-edge shrink-to-fit and one-character-wide quotes. Leave space for the
upward animation. `tests/themes-quotes.spec.js` covers all four desktop/mobile edges.

`.click-pop-text` animation is **1s** (`clickPopText` keyframes), background `rgba(17,20,32,.52)`,
peak opacity `0.9`; the reduced-motion branch removes it at `1000ms`. It used to be 2.8s.

Because the window is only 1s, **never** write tests that click and then poll for the popup — that
races the window and is flaky under parallel workers. Use `tests/helpers/quote-trace.js`
(`installQuoteTrace` before the click, `readQuoteTrace` after) and assert the measured lifetime.
The exact spec is asserted through `animationDuration === "1s"`; the wall-clock bound is deliberately
loose (`400ms … 2600ms`) because `setTimeout` slips under load. The old 2.8s is still caught.
