import { readFileSync } from 'node:fs';

// Đọc version từ package.json (chạy được cả từ src/ khi dev lẫn dist/ khi build).
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  version: string;
};

export const SERVER_VERSION: string = pkg.version;
