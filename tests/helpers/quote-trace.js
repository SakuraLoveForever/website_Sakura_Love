/**
 * 语录浮层的确定性测量工具。
 *
 * 2026-10-06 起语录存活时间只有 1s（原 2.8s），任何「先点击、再用轮询断言它还在」
 * 的写法都会和这 1s 窗口赛跑，在并行跑测时必然 flaky。
 * 这里在点击之前就装好 MutationObserver，把「何时出现 / 何时移除 / 出现瞬间的样式」
 * 一次性记录下来，测试只读结果，不再争抢时间窗口。
 */

const INSTALL = () => {
  window.__quoteTrace = { seen: 0, addedAt: 0, removedAt: 0, life: 0, text: '', duration: '', background: '' };
  const capture = (el) => {
    const trace = window.__quoteTrace;
    if (!el || trace.addedAt) return;
    trace.seen = 1;
    trace.addedAt = performance.now();
    const cs = getComputedStyle(el);
    trace.text = (el.textContent || '').trim();
    trace.duration = cs.animationDuration;
    trace.background = cs.backgroundColor;
  };
  capture(document.querySelector('.click-pop-text'));
  new MutationObserver(() => {
    const trace = window.__quoteTrace;
    const el = document.querySelector('.click-pop-text');
    capture(el);
    if (!el && trace.addedAt && !trace.removedAt) {
      trace.removedAt = performance.now();
      trace.life = trace.removedAt - trace.addedAt;
    }
  }).observe(document.body, { childList: true, subtree: true });
};

/** 在点击之前调用：装上观察器。 */
const installQuoteTrace = (page) => page.evaluate(INSTALL);

/** 点击后调用：等到语录消失并返回测量结果。 */
const readQuoteTrace = async (page, timeout = 6000) => {
  await page.waitForFunction(() => window.__quoteTrace && window.__quoteTrace.removedAt > 0, null, { timeout });
  return page.evaluate(() => ({ ...window.__quoteTrace }));
};

module.exports = { installQuoteTrace, readQuoteTrace };
