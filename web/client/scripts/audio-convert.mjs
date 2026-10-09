// Chuyển mọi file WAV trong public/assets/audio sang OGG (Chrome/Edge/Firefox) + MP3 (Safari).
// Dùng ffmpeg-static (ffmpeg đóng gói trong node_modules) vì máy không có ffmpeg hệ thống.
// Bỏ qua file đã chuyển và mới hơn WAV gốc, nên chạy trước mỗi lần dev/build vẫn nhanh.
import { spawnSync } from 'node:child_process';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets', 'audio');
const force = process.argv.includes('--force');

// Chất lượng: OGG Vorbis q5 (~160 kbps), MP3 VBR q4 (~165 kbps) — đủ cho nhạc nền, file nhỏ.
const targets = [
  { ext: '.ogg', args: ['-c:a', 'libvorbis', '-q:a', '5'] },
  { ext: '.mp3', args: ['-c:a', 'libmp3lame', '-q:a', '4'] },
];

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}

if (!ffmpegPath || !existsSync(ffmpegPath)) {
  console.error('[audio:convert] Không tìm thấy ffmpeg-static. Chạy lại `npm install` (cần cho phép script cài đặt của ffmpeg-static).');
  process.exit(1);
}
if (!existsSync(root)) {
  console.log('[audio:convert] Chưa có thư mục audio, bỏ qua.');
  process.exit(0);
}

let converted = 0;
let skipped = 0;
let failed = 0;
for (const wav of walk(root).filter((f) => extname(f).toLowerCase() === '.wav')) {
  const wavTime = statSync(wav).mtimeMs;
  for (const t of targets) {
    const out = join(dirname(wav), basename(wav, extname(wav)) + t.ext);
    if (!force && existsSync(out) && statSync(out).mtimeMs >= wavTime) {
      skipped++;
      continue;
    }
    const r = spawnSync(ffmpegPath, ['-y', '-loglevel', 'error', '-i', wav, ...t.args, out], { stdio: 'inherit' });
    if (r.status === 0) converted++;
    else {
      failed++;
      console.error(`[audio:convert] Lỗi khi chuyển ${wav} → ${t.ext}`);
    }
  }
}
console.log(`[audio:convert] đã chuyển ${converted}, bỏ qua ${skipped} (đã mới), lỗi ${failed}`);
process.exit(failed > 0 ? 1 : 0);
