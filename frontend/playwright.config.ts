import { defineConfig, devices } from '@playwright/test';

const api = process.env.E2E_MODE === 'api';
const preview = process.env.E2E_PREVIEW === '1';
const externalURL = process.env.E2E_BASE_URL;
const basePath = process.env.E2E_BASE_PATH || '/';
export default defineConfig({
  testDir: './tests', fullyParallel: false, workers: 1, retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: externalURL || (api ? 'http://127.0.0.1:8080/' : `http://127.0.0.1:4173${basePath}`), trace: 'retain-on-failure' },
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'] } }, { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } }],
  webServer: api || externalURL ? undefined : { command: `npm run ${preview ? 'preview' : 'dev'} -- --port 4173 --strictPort`, url: `http://127.0.0.1:4173${basePath}`, reuseExistingServer: false, env: { VITE_STORAGE_MODE: 'demo', VITE_BASE_PATH: basePath } },
});
