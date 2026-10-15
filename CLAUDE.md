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
| `/git-commit [nội dung]` | Commit **toàn bộ** thay đổi (tác giả vudzai, không Co-Authored-By) và **tự push** lên GitHub |
| `/git-pull [nhánh]` | Kéo code mới từ GitHub về an toàn, không làm mất việc đang dở |

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

- **Cách chạy chuẩn: Docker (môi trường dev, có hot reload)** — một lệnh bật cả database + server + client:
  - Bật: bấm đúp `web/start.bat` (kiểm trước → bật → chờ sẵn sàng rồi tự mở http://localhost:5173) hoặc `npm run up` ở `web/` · Dừng: `web/stop.bat` hoặc `npm run down` (dữ liệu DB giữ lại) · Xem log: `npm run logs` · Trạng thái: `npm run ps` · Khởi động lại server+client: `npm run restart`
  - Kiểm trước khi bật (T-010, `web/docker/preflight.ps1`, cũng chạy riêng được: `npm run preflight`): Docker Desktop đang chạy; cổng DB/3000/5173 không bị chương trình khác chiếm (bận → báo cổng nào, ai chiếm, cách sửa; không bật nửa chừng); thiếu `web/server/.env` → tự tạo từ `.env.example` với `SESSION_SECRET` ngẫu nhiên (không in ra). `BPH_SERVER_ENV_FILE` (chỉ để kiểm thử) trỏ file `.env` khác
  - **Cổng DB trên máy: `POSTGRES_PORT` trong `web/.env` (gitignore, mẫu `web/.env.example`), mặc định 5433** (5432 hay bị Postgres dự án khác chiếm). Bên trong Docker server vẫn nối `db:5432`
  - 3 container: `bph-db` (Postgres 16, 127.0.0.1:5433 — theo `POSTGRES_PORT`), `bph-server` (http://localhost:3000; entrypoint tự `prisma generate` khi thiếu Prisma client hoặc `schema.prisma`/lock đổi, báo một dòng nếu thiếu `server/.env`, rồi `prisma migrate deploy` + `tsx watch`), `bph-client` (Vite http://localhost:5173, proxy `/api` → `http://server:3000`). Cấu hình: `web/docker-compose.yml`, `web/Dockerfile.dev`, `web/docker/dev-entrypoint.sh`
  - Mã nguồn `web/` được gắn vào container → sửa code là server/client tự nạp lại (quét file định kỳ vì Docker trên Windows không báo file đổi). `node_modules` bản Linux nằm trong volume riêng (`bph_bph-nm-*`), không dùng chung với node_modules của Windows. Đổi `package-lock.json` (thêm thư viện) → container server tự `npm ci` lại lần khởi động sau (`npm run restart`); đổi `Dockerfile.dev` → `npm run up` (có `--build`)
  - Chạy lệnh trong container: `docker compose exec server npx prisma migrate dev --name <ten>` (tạo migration) · `docker compose exec server npm run test -w @bph/server` · `docker compose exec server sh` (mở shell)
  - Server trong Docker vẫn đọc bí mật (`SESSION_SECRET`…) từ `web/server/.env` (thiếu/sai biến → server dừng với một dòng `[config] …` nêu tên biến + chỗ sửa); `HOST`, `DATABASE_URL` (trỏ `db:5432`), `CLIENT_ORIGIN` lấy từ `docker-compose.yml` (ưu tiên hơn `.env`)
  - **Agent kiểm tra (`qa-tester`, e2e) dùng stack Docker**: `npm run up` rồi `npm run test:e2e` từ máy (Playwright dùng lại client đang chạy ở 5173)
- **Lệnh npm, chạy từ `web/`** (npm workspaces: `shared`, `server`, `client`, `e2e`; một `package-lock.json` duy nhất ở `web/`):
  - Lần đầu trên máy (cần cho test/build/e2e chạy ngoài Docker): `npm install` (tự build `@bph/shared`, sinh Prisma client, tải ffmpeg) → `npx playwright install chromium`
  - Cách cũ không Docker (vẫn dùng được, đừng chạy song song với stack Docker vì trùng cổng): `npm run db:up` (chỉ DB, cổng máy `POSTGRES_PORT` mặc định 5433 — `DATABASE_URL` trong `server/.env` phải là `postgresql://bph:bph_dev_only@localhost:5433/bph?schema=public`) → `cd server && npx prisma migrate dev` → `npm run dev:server` (http://localhost:3000) · `npm run dev:client` (http://localhost:5173)
  - Kiểm: `npm run build` (shared → server → client) · `npm run test` (server + client; test server cần DB — chạy trên máy thì nối qua `DATABASE_URL` cổng 5433, hoặc chạy trong container; `SKIP_DB_TESTS=1` để bỏ) · `npm run lint` · `npm run test:e2e` (Playwright, tự bật dev client nếu chưa chạy; ảnh chụp ở `web/e2e/screenshots/`) · `npm run db:down` dừng DB
  - Script cài đặt được phép (npm 11) khai trong `allowScripts` của `web/package.json` (ffmpeg-static, prisma, @prisma/engines, esbuild); nâng phiên bản thì chạy lại `npm install-scripts approve <gói>` ở `web/`
- `web/client/` (`@bph/client`) — Phaser 3.90 + TypeScript 6 (strict) + Vite 8 + Vitest 5 + ESLint 10
  - Lệnh riêng (`npm run <lệnh> -w @bph/client`): `dev` (cổng 5173 cố định; `/api` proxy sang http://localhost:3000; trong Docker đọc env `BPH_DEV_HOST`, `BPH_API_TARGET`, `BPH_USE_POLLING` ở `vite.config.ts`) · `build` (tsc + vite → `dist/`, bỏ WAV) · `test` · `lint` · `audio:convert` (WAV → OGG + MP3 bằng ffmpeg-static; tự chạy trước dev/build; OGG/MP3 sinh ra bị gitignore, WAV gốc được commit có chủ ý)
  - Thông số gameplay: `src/config/gameConfig.ts` · bảng màu: `src/config/palette.ts` · danh sách asset: `src/config/assets.ts` · dữ liệu nội dung: `src/data/*.json` (+ kiểu ở `src/data/types.ts`) · logic thuần TS + test: `src/systems/` · phím: `src/input/InputController.ts` · gọi server: `src/net/api.ts` (type API từ `@bph/shared`)
  - Scene: `Boot → Preload → Garden` (+ `GardenHud` chạy song song: Sức, tiền, đồng hồ, hotbar, gùi, các cửa sổ); `?scene=sandbox` mở màn thử cũ. Debug hook QA: `window.__game` (Phaser.Game); Garden đặt `registry.gardenReady = true`, đọc trạng thái qua `getScene('Garden').debugState` và các hàm `debug*` trong `GardenScene.ts`. Cửa sổ/tạm dừng dùng `PauseReasons` (`src/systems/pause.ts`); phím thử G/F8/F9 chỉ có ở bản dev (`devCheatsEnabled`)
  - Lưu game (T-008, D-025): localStorage key `bph-save` (bản hỏng → `bph-save-corrupt`); type + kiểm tra ở `@bph/shared` (`src/save/gameSave.ts`), client `src/systems/save.ts` + `src/net/saveLocal.ts`. E2E muốn `page.reload()` vào Ngày 1 sạch thì gọi `debugClearSave()` trước
  - Nông cụ (T-009, D-026): `src/data/tools.json` — cuốc `cuoc-go` là món trong gùi, game mới ở **ô 1** (đang chọn), hạt từ ô 2; chỉ cuốc khi ô đang chọn là cuốc (`canTillWithSelected` ở `systems/items.ts`); save thiếu cuốc tự thêm khi nạp (`SaveRules.requiredItems`). Hoạt ảnh động tác: spritesheet khung 128×128 (`actionSpritesheets`, `HERO_ACTION_FRAME`, origin chân 111/128) — khung tính từ tiến độ nhát (`systems/toolAnim.ts`), không dùng anim Phaser. E2E muốn cuốc thì giữ ô 1 (hoặc `page.keyboard.press('1')`); `debugState.hoeFrame`, `inventory.heldToolUse`
  - Động tác tưới / cúi (T-023): dải `hero-t1-{hoe,water,bend}-<hướng>` cùng chuẩn (khoá `heroActionKey`), việc → dáng ở `actionAnimFor`; việc nhanh chỉ hiện dáng khi ĐỨNG (đang đi giữ khung bước — `showActionPose`); `debugState.actionAnim`
  - Đồ vật có hình (T-024): cỡ ảnh, chân đế, cửa, `sellerSpot`… đọc từ `public/assets/art/props/props.json` (`systems/props.ts`, nạp bằng `import.meta.glob`); `gardenLayout.json` ghi vật dạng `{ prop, x, y }` = ô trên-trái **chân đế**, `resolveLayout` (garden.ts) đổi ra TileRect. Mảnh rào tre / dâm bụt, thúng đóng/hé, tán che: `systems/propArt.ts`; ảnh nạp theo `PROP_IMAGES` (assets.ts). Tán cây depth cố định trên nhân vật. `debugState.props`. Ảnh chụp tự kiểm: `node web/e2e/diag-t023-t024.mjs`
  - Nền tile (T-021): bản đồ chỉ ghi *loại nền* từng ô (cỏ / lối / sân / ruộng — `gardenLayout.json` `path`, `yard`, `pathBranches`, nền nhà tính là đất), code dựng Tilemap 4 lớp (lõi → viền luống → mép cỏ → góc lõm) từ các tấm `TILE_SHEETS` (`config/assets.ts`, khóa `tile-<tên>`, nạp bản `-ex` margin 1 spacing 2); logic chọn ô ở `systems/groundTiles.ts`. Ảnh thiếu → texture tạm vẽ bằng code + `console.warn`. QA đọc `debugState.ground`
  - Cây + icon (T-022): `crops.json` mỗi cây có `sprite` / `icon` / `seedIcon` = khóa texture = tên file (`props/`, `items/`); thêm cây chỉ cần dữ liệu + file. Khung cây chọn ở `systems/cropArt.ts`; icon món qua `itemIconKey` (`systems/items.ts`), không có → vẽ bằng code. QA đọc `debugState.crops[].sprite/frame`, `hud.hotbarImages`. Script chụp nhanh nền + cây + icon: `node web/e2e/diag-t021.mjs` (cần client ở 5173)
  - Cảnh trong nhà + chuyển khu (T-093): phòng là **khu `house`** cùng thế giới với Vườn, đặt dưới bản đồ Vườn (`systems/house.ts`; số đo phòng từ `props.json` `_interior`, đồ đạc + `wakeSpot` ở `src/data/houseLayout.json`, toạ độ px trong ảnh phòng). Camera + giới hạn vật lý đổi theo khu (`applyAreaView`; đổi giới hạn TRƯỚC `Body.reset`). Chuyển khu dùng chung: `systems/areas.ts` (`out → swap → in`, tên khu) + `beginAreaChange(khu, chỗ đứng, hướng)` trong GardenScene (tự lưu lý do `area`); thêm khu mới (T-054) = thêm vào `AreaId` / `AREA_NAMES`. Save version 2: `chest` + `player.area` (`garden` | `house`), toạ độ tính từ góc khu. QA: `debugState.area` / `.chest`, `debugEnterArea(khu, local?)`, `debugHouseObjectScreen(id)`, `debugSetChestSlot`; script chụp `web/e2e/diag-t093.mjs`. Chõng hiên (`L.bed`) không ngủ nữa — e2e cũ ngủ ở chõng cần `debugEnterArea('house')`
  - Click đâu đi đó (T-096, D-038): tìm đường thuần TS `src/systems/pathfind.ts` (A* 8 hướng, lưới `NavGrid`) + `src/systems/clickMove.ts` (lập đường, đi theo đường); Vườn dùng `blockedGrid`, trong nhà `houseNavGrid` (ô `houseNavCellPx`). Click ngoài tầm / ô trống = tự đi tới, việc chờ làm khi với tới; việc ruộng luôn bước tới SÁT ô (`farmWorkRange`, `planFarmStand`, `driveTileQueue`; `stepTileAction` có `canStart` giữ ô đầu hàng chờ tới khi đứng sát); WASD / cửa sổ huỷ. Chạm = click trái (pointer chung, không dựa hover). QA đọc `debugState.clickMove`, chuyển toạ độ thế giới → màn bằng `debugWorldToScreen(x, y)`; script `web/e2e/diag-t096.mjs`
  - Giao diện (T-092): ảnh ở `public/assets/art/ui/` + `ui.json` (lề 9-slice, vùng chữ…) — đọc qua `src/ui/uiSpec.ts` (thuần TS, khóa texture `ui-<tên>`), dựng bằng `src/ui/uiKit.ts`: `UiFrame` (khung 9-slice đổi kiểu bằng `setFrame`), `UiButton` (4 trạng thái, `buttonState(enabled, hover, down)`), `buildPaperWindow` (nền mờ + giấy điệp + nút X — cửa sổ mới dùng hàm này), `addUiIcon`. Khung hiển thị 1:1 ở 1080p, không setScale; thiếu ảnh / không WebGL → vẽ bằng code + `console.warn('[UI] …')`. Chữ trên giấy: `paperText` (mực), trên gỗ: `woodText` (`config/theme.ts`). Bong bóng: `showBubble(text, kind, style)` (style `normal|boast|curse|think`), vẽ 1:1 với màn (container co 1/zoom). Ảnh chụp kiểm: `web/e2e/diag-t092.mjs`
  - Âm thanh (T-026): MỌI tiếng qua `src/audio/AudioManager.ts` (`AudioManager.of(game)`, một cái cho cả game) — tiếng ngắn gọi theo **tên cue** `audio.play('<cue>')` ở `src/config/soundCues.ts` (biến thể, kênh, âm lượng, lệch cao độ, nghỉ tối thiểu; khoá file ở `config/assets.ts` `audio`); nhạc nền + tiếng nền `amb-*` do `update(dt, soundscape)` mỗi frame tự đan chéo (Garden `tickAudio`: chọn theo giờ / khu bằng `chooseMusic` / `chooseAmbience` ở `systems/audio.ts`). Không gọi `this.sound.play` trực tiếp. 2 kênh Nhạc (nhạc + jingle) / Hiệu ứng (còn lại), âm lượng lưu localStorage `bph-settings` (`net/settingsLocal.ts`, riêng với save), nút −/+ ở cửa sổ Tạm dừng. Gà gáy theo ngày từ `seed` trong save (version 3). Âm thanh khoá tới lần bấm đầu — AudioManager không phát gì lúc khoá. QA: `debugState.audio`, `debugVolumeButtonCenter(id)`
  - E2E chạy `workers: 1`; test chờ theo trạng thái game (`expect.poll` / đếm frame), tránh `waitForTimeout` cố định (BUG-006)
- `web/e2e/` (`@bph/e2e`) — Playwright (chromium), smoke test ở `tests/smoke.spec.ts`
- `web/server/` (`@bph/server`) — Node 24 + TS strict + Fastify 5 + Prisma 7 (adapter `pg`) + Vitest. `src/app.ts` dựng app (test bằng `app.inject`), `src/server.ts` mở cổng, `src/config.ts` đọc `.env` có kiểm tra, `src/routes/`, sơ đồ CSDL `prisma/schema.prisma`, migration `prisma/migrations/`
  - Trong `web/server`: `npm run build` → `npm start` · đổi CSDL: sửa `schema.prisma` rồi `npx prisma migrate dev --name <ten>`
  - Kiểm tra: `GET /healthz`, `GET /api/health` → `{ ok, db, version }`
- `web/shared/` (`@bph/shared`) — type dùng chung (API, schema save); import `from '@bph/shared'`; sửa xong chạy `npm run build -w @bph/shared` (server tự build trước dev/test/build; `npm run build` ở gốc build trước client)
- Asset cuối: `web/client/public/assets/art/<loại>/`, `.../audio/<music|sfx|ui>/`
- Bí mật chỉ ở `web/server/.env` (gitignore) — không bao giờ in ra hay commit.

## Nguyên tắc

- Mỗi lần một bước/task nhỏ, game luôn chạy được; kiểm chứng trước khi báo xong và nói rõ cái gì đã kiểm, cái gì người dùng cần tự thử. Kiểm chứng = unit test + lint + tsc (build nếu nhanh); **không chụp màn hình bằng Playwright, không chạy e2e** (người dùng chốt 2026-10-14, D-036) — chỉ ghi chú nội dung đã làm, người dùng tự thử trên trình duyệt.
- Ý tưởng ngoài scope → "Để sau" trong GDD. Từ chặng 4 trở đi hạn chế thêm tính năng.
- Commit: khi `/next` hoàn thành một bước, tạo commit điểm lưu cục bộ (chỉ push lên GitHub `origin` khi người dùng yêu cầu — gõ `/git-commit` tính là yêu cầu: commit toàn bộ + push). Ngoài ra chỉ commit khi người dùng yêu cầu.
- Không tự thêm thư viện lớn, không tạo tài nguyên GCP tốn phí, không deploy khi chưa hỏi người dùng.
