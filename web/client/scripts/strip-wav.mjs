// Sau `vite build`: xóa WAV gốc khỏi dist/ (Vite chép nguyên thư mục public/).
// Game chỉ tải OGG/MP3, WAV chỉ là bản gốc để chuyển đổi — bỏ đi cho bản phát hành nhẹ.
import { readdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
let removed = 0;
function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.toLowerCase().endsWith('.wav')) {
      rmSync(p);
      removed++;
    }
  }
}
if (existsSync(dist)) walk(dist);
console.log(`[strip-wav] đã bỏ ${removed} file WAV khỏi dist/`);
