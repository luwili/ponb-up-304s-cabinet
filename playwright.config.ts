import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir:'tests/browser',timeout:30000,fullyParallel:true,workers:2,
  use:{baseURL:'http://127.0.0.1:4174',headless:true,channel:'chromium',trace:'retain-on-failure'},
  webServer:{command:'npx tsx tests/browser/server.ts',url:'http://127.0.0.1:4174/empty/',reuseExistingServer:false},
  reporter:'list'
});
