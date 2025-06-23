/**
 * Playwright Configuration
 * Developer: Rakula (ID: 3222)
 * Created: June 2025
 */

require('dotenv').config();

// Read configuration values from environment or use defaults
const headless = process.env.HEADLESS !== 'false';
const timeout = parseInt(process.env.TIMEOUT || '60000');

module.exports = {
  use: {
    headless: headless,
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    timeout: timeout,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
  },
  testDir: './tests',
  workers: 1,  // Run one test at a time for more stable results
  retries: 1,  // Retry failed tests once
  reporter: [
    ['list'],
    ['html', { outputFolder: './reports/playwright-report' }]
  ],
};
