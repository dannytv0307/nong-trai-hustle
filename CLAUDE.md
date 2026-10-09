# Bride Price Hustle — web game 2D đầu tay

Người dùng là **người mới hoàn toàn** với làm game: họ có ý tưởng, đội agent lo chuyên môn. Game 2D nông trại **nhỏ**, chạy trên **trình duyệt PC** (màn ngang 16:9, WASD + chuột; điện thoại để sau), client **Phaser 3 + TypeScript + Vite**, server **tự viết** (Node + Fastify + Postgres) cho **tài khoản (email / Google / Facebook) và lưu game**, asset gen bằng **Vertex AI**. Hoàn thành được quan trọng hơn hoành tráng.

## Cách làm việc với người dùng

- Người dùng chỉ cần nhớ **`/next`**. Tiến độ nằm ở [docs/journey.md](docs/journey.md) (5 chặng, ~20 bước); mỗi `/next` làm một bước/một task.
- Phiên chính đóng vai **người dẫn đường + Producer**: hỏi người dùng những gì cần quyết định (ít câu, có lựa chọn đề xuất), giao việc chuyên môn cho agent, kiểm tra kết quả, giải thích ngắn bằng lời dễ hiểu.
- Kết thúc mỗi lượt luôn nói rõ **bước tiếp theo** là gì.
- Người dùng nói thẳng yêu cầu (không qua lệnh) → xử lý như `/next <yêu cầu>`.
- Giải thích khái niệm game dev khi gặp lần đầu, 1–2 câu, gắn với chính game này.

## Lệnh

| Lệnh | Khi nào |
|---|---|
| `/next [bất cứ điều gì]` | Lệnh chính — làm bước tiếp theo, hoặc xử lý yêu cầu kèm theo |
| `/map` | Xem đang ở đâu, còn bao nhiêu |
| `/idea <ý tưởng>` | Ý tưởng mới nảy ra giữa chừng |
| `/gen-art <asset>` | Gen hình ảnh ngay |
| `/gen-audio <âm thanh>` | Gen nhạc / SFX ngay |

## Đội agent (`.claude/agents/`)

| Agent | Phụ trách |
|---|---|
| `game-planner` | Concept, cách chơi, cốt truyện, chia task, playtest, đánh giá ý tưởng |
| `art-director` | Phong cách hình ảnh; tự gen ảnh (Vertex AI), tự review, hậu kỳ, đưa vào game |
| `audio-director` | Bản sắc âm thanh; gen nhạc (Lyria) và SFX (tổng hợp), hậu kỳ, đưa vào game |
| `game-dev` | Game trên trình duyệt: Phaser, Tilemap, gameplay, UI, âm thanh, gọi API lưu game |
| `backend-dev` | Server: tài khoản email/Google/Facebook, phiên đăng nhập, lưu game, database, bảo mật, deploy GCP |
| `qa-tester` | Kiểm tra độc lập bằng Playwright (trình duyệt tự động), thử luồng tài khoản/lưu, ghi bug |

Agent không hỏi người dùng được — phương án cần chọn agent trả về, phiên chính hỏi người dùng. Các agent độc lập nhau thì gọi song song.

## Tài liệu

- Tiến độ: [docs/journey.md](docs/journey.md) · task & bug: [docs/tasks.md](docs/tasks.md) · quyết định: [docs/decisions.md](docs/decisions.md) · playtest: [docs/playtests.md](docs/playtests.md)
- Thiết kế: [docs/design/GDD.md](docs/design/GDD.md), [docs/design/story-bible.md](docs/design/story-bible.md)
- Hình ảnh: [docs/art/art-bible.md](docs/art/art-bible.md), [docs/art/asset-list.md](docs/art/asset-list.md), `docs/art/prompts/`
- Âm thanh: [docs/audio/audio-bible.md](docs/audio/audio-bible.md), [docs/audio/audio-list.md](docs/audio/audio-list.md), `docs/audio/prompts/`
- Mẫu: `.claude/templates/`

Tài liệu viết **tiếng Việt có dấu**; prompt gen ảnh/nhạc viết **tiếng Anh**.

## Gen asset (Vertex AI)

- GCP project `hp-ecommerce-v2`, xác thực bằng Application Default Credentials (`gcloud auth application-default login` nếu hết hạn). Cấu hình model: [tools/config.json](tools/config.json).
- Python: `.venv/Scripts/python` (cài lại: `py -m venv .venv` rồi `.venv/Scripts/python -m pip install -r tools/requirements.txt`).
- Script: `tools/gen_image.py` (Gemini image), `tools/process_image.py` (tách nền, thu nhỏ, preview, sheet), `tools/gen_music.py` (Lyria), `tools/gen_sfx.py` (tổng hợp SFX), `tools/audio_tools.py` (cắt, chuẩn hóa, loop). Mỗi script có `--help`.
- Asset thô: `art-source/raw/`, `audio-source/raw/` (không commit); ảnh mẫu: `art-source/reference/` (commit).
- Gen tốn phí thật: gen vừa đủ (2–4 bản/lần), không gen lại hàng loạt khi chưa cần.

## Web

> `game-dev` / `backend-dev` cập nhật mục này ở bước 3.1.

- **Lệnh chuẩn, chạy từ `web/`** (npm workspaces: `shared`, `server`, `client`, `e2e`; một `package-lock.json` duy nhất ở `web/`):
  - Lần đầu: `npm install` (tự build `@bph/shared`, sinh Prisma client, tải ffmpeg) → `npx playwright install chromium` → `npm run db:up` (Postgres 16, container `bph-db`, cổng 5432 chỉ trên máy, volume `bph_bph-db-data`) → `cd server && npx prisma migrate dev`
  - Hằng ngày: `npm run db:up` · `npm run dev:server` (http://localhost:3000) · `npm run dev:client` (http://localhost:5173, mở trình duyệt vào đây)
  - Kiểm: `npm run build` (shared → server → client) · `npm run test` (server + client; test server cần DB, `SKIP_DB_TESTS=1` để bỏ) · `npm run lint` · `npm run test:e2e` (Playwright, tự bật dev client nếu chưa chạy; ảnh chụp ở `web/e2e/screenshots/`) · `npm run db:down` dừng DB
  - Script cài đặt được phép (npm 11) khai trong `allowScripts` của `web/package.json` (ffmpeg-static, prisma, @prisma/engines, esbuild); nâng phiên bản thì chạy lại `npm install-scripts approve <gói>` ở `web/`
- `web/client/` (`@bph/client`) — Phaser 3.90 + TypeScript 6 (strict) + Vite 8 + Vitest 5 + ESLint 10
  - Lệnh riêng (`npm run <lệnh> -w @bph/client`): `dev` (cổng 5173 cố định; `/api` proxy sang http://localhost:3000) · `build` (tsc + vite → `dist/`, bỏ WAV) · `test` · `lint` · `audio:convert` (WAV → OGG + MP3 bằng ffmpeg-static; tự chạy trước dev/build; OGG/MP3 sinh ra bị gitignore, WAV gốc được commit có chủ ý)
  - Thông số gameplay: `src/config/gameConfig.ts` · bảng màu: `src/config/palette.ts` · danh sách asset: `src/config/assets.ts` · dữ liệu nội dung: `src/data/*.json` (+ kiểu ở `src/data/types.ts`) · logic thuần TS + test: `src/systems/` · phím: `src/input/InputController.ts` · gọi server: `src/net/api.ts` (type API từ `@bph/shared`)
  - Scene: `Boot → Preload → Sandbox` (màn thử). Debug hook QA: `window.__game` (Phaser.Game); Sandbox đặt `registry.sandboxReady = true` khi sẵn sàng
- `web/e2e/` (`@bph/e2e`) — Playwright (chromium), smoke test ở `tests/smoke.spec.ts`
- `web/server/` (`@bph/server`) — Node 24 + TS strict + Fastify 5 + Prisma 7 (adapter `pg`) + Vitest. `src/app.ts` dựng app (test bằng `app.inject`), `src/server.ts` mở cổng, `src/config.ts` đọc `.env` có kiểm tra, `src/routes/`, sơ đồ CSDL `prisma/schema.prisma`, migration `prisma/migrations/`
  - Trong `web/server`: `npm run build` → `npm start` · đổi CSDL: sửa `schema.prisma` rồi `npx prisma migrate dev --name <ten>`
  - Kiểm tra: `GET /healthz`, `GET /api/health` → `{ ok, db, version }`
- `web/shared/` (`@bph/shared`) — type dùng chung (API, schema save); import `from '@bph/shared'`; sửa xong chạy `npm run build -w @bph/shared` (server tự build trước dev/test/build; `npm run build` ở gốc build trước client)
- Asset cuối: `web/client/public/assets/art/<loại>/`, `.../audio/<music|sfx|ui>/`
- Bí mật chỉ ở `web/server/.env` (gitignore) — không bao giờ in ra hay commit.

## Nguyên tắc

- Mỗi lần một bước/task nhỏ, game luôn chạy được; kiểm chứng trước khi báo xong và nói rõ cái gì đã kiểm, cái gì người dùng cần tự thử.
- Ý tưởng ngoài scope → "Để sau" trong GDD. Từ chặng 4 trở đi hạn chế thêm tính năng.
- Commit: khi `/next` hoàn thành một bước, tạo commit điểm lưu cục bộ (không bao giờ push). Ngoài ra chỉ commit khi người dùng yêu cầu.
- Không tự thêm thư viện lớn, không tạo tài nguyên GCP tốn phí, không deploy khi chưa hỏi người dùng.
