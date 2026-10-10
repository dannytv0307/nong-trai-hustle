// QA: chạy lại test T-002 trên Microsoft Edge (kênh msedge) — không đụng cấu hình chính.
import base from './playwright.config';
import { defineConfig } from '@playwright/test';
export default defineConfig({ ...base, projects: [{ name: 'msedge', use: { channel: 'msedge' } }] });
