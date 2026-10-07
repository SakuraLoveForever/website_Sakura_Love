const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  /*
   * 默认 workers = CPU 数的一半，在本机是 10。但看板娘用例要加载 17MB 的 .moc3
   * 并用软件 GL 渲染，跑满并行度会把机器压到 actionability 检查（10s）超时，
   * 表现为大量「locator.click: Timeout」假失败。固定小并行度换取可复现的结果。
   * 需要更快时用 `npx playwright test --workers=6` 临时覆盖。
   */
  workers: 2,
  use: {
    baseURL: 'http://127.0.0.1:8080',
    headless: true,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 10000,
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'node server.js --port 8080',
    url: 'http://127.0.0.1:8080',
    reuseExistingServer: true,
  },
});
