# Danh sách task

> Chủ sở hữu: `game-planner`. Dùng cho các bước "nhiều buổi" (3.3, 4.2, 4.4…). Mỗi lần `/next` làm task đầu tiên chưa xong.
> Trạng thái: ⬜ chưa làm · 🔄 đang làm · 👀 chờ bạn thử · ✅ xong · ⛔ bị chặn (ghi lý do)

## Chặng 3 — Prototype "một ngày ở Vườn" (D-019)

Mục tiêu: trả lời câu hỏi **"làm nông có vui không?"** bằng hình khối, trước khi tốn công làm đẹp. Phạm vi: chỉ bản đồ Vườn; đi lại, cuốc–gieo–tưới–hái, thanh Sức, đồng hồ ngày, gùi + hotbar tối thiểu, thùng bán, ngủ sang ngày mới, tổng kết ngày, tự lưu trong trình duyệt. **Chưa có**: NPC, mặc cả, khu khác, nấu ăn, thời tiết, level/nhiệm vụ, meme, đăng nhập (đăng nhập + lưu server ở bước 3.4).

Mỗi task được `qa-tester` kiểm (Playwright chụp màn hình + đọc trạng thái game) trước khi chuyển sang 👀 cho bạn thử.

| ID | Bước | Task | Ai làm | Size | Cần trước | Trạng thái |
|---|---|---|---|---|---|---|
| T-001 | 3.3 | Dựng bản đồ Vườn thử, va chạm và camera đi theo | game-dev | M | — | ⬜ |
| T-002 | 3.3 | Chỉ ô bằng chuột, tầm với và cuốc đất (giữ chuột để cuốc cả luống) | game-dev | M | T-001 | ⬜ |
| T-003 | 3.3 | Gieo, tưới, hái + hotbar 9 ô và gùi tối thiểu | game-dev | L | T-002 | ⬜ |
| T-004 | 3.3 | Thanh Sức, "đuối", ăn khoai bằng chuột phải, bong bóng chửi thề | game-dev | M | T-003 | ⬜ |
| T-005 | 3.3 | Đồng hồ ngày trên HUD, trời tối dần, tạm dừng (Esc / chuyển tab) | game-dev | M | T-001 | ⬜ |
| T-006 | 3.3 | Thùng bán, tiền và sạp hạt tạm | game-dev | M | T-003, T-005 | ⬜ |
| T-007 | 3.3 | Ngủ, ngủ gục sau 24h, sang ngày mới (cây lớn, héo) và tổng kết ngày | game-dev | L | T-004, T-006 | ⬜ |
| T-008 | 3.3 | Tự lưu trong trình duyệt, F5 vào lại đúng chỗ, đúng giờ | game-dev | M | T-007 | ⬜ |
| T-009 | 3.3 | Tinh chỉnh cảm giác chơi theo góp ý của bạn | game-planner + game-dev | M | T-008 | ⬜ |

**Tổng ước lượng:** 2 L + 7 M ≈ **40–46 giờ** (S = 1–2 giờ, M = 3–4 giờ, L = 6–8 giờ), cộng thời gian bạn thử và góp ý. Với **15 giờ/tuần**: khoảng **3 tuần** cho bước 3.3.

> Chặng 4 (đã lên lịch, D-020): chu trình bước đi thật 4 khung × 4 hướng cho {ten} (AI gen + chỉnh), áp dụng lần lượt cho 4 bậc ngoại hình — `art-director` + `game-dev`.

## Chi tiết task

### T-001 — Dựng bản đồ Vườn thử, va chạm và camera đi theo

**Bước:** 3.3 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** —

**Mục tiêu:** đi bằng WASD trên một bản đồ Vườn lớn hơn màn hình, đụng nhà/cây/ao thì dừng lại, camera bám theo nhân vật — để cảm được "đi lại có sướng tay không".

**Điều kiện xong** (kiểm chứng được, ưu tiên thấy được trong trình duyệt):
- [ ] Mở game vào thẳng scene mới **`GardenScene`** (Vườn thử). Sandbox cũ vẫn mở được bằng `http://localhost:5173/?scene=sandbox`.
- [ ] Bản đồ Vườn **48 × 32 ô** (GDD §5), dựng bằng code (chưa cần Tiled). Nền cỏ bằng tile thử; có **khối nhà** (hình chữ nhật, có ô cửa và giường bên trong), **vài khối cây**, **một ao nước**, **hàng rào** quanh mép, **vùng ruộng 3×3** (9 ô, `startPlots`) gần nhà; chừa chỗ đặt thùng bán và sạp hạt (T-006).
- [ ] Nhân vật dùng **Arcade Physics**, hộp va chạm nhỏ ở chân (`playerFootHitbox`): đi sát nhà, cây, ao, rào thì dừng lại, trượt dọc theo cạnh (không bị kẹt). Đi được 8 hướng, đi chéo không nhanh hơn đi thẳng.
- [ ] Nhân vật đi sau cây/nhà đúng lớp (depth theo trục Y).
- [ ] **Hoạt ảnh đi bằng code (D-020)** để hết cảm giác "trượt": khi đi, sprite nảy theo nhịp bước (`walkBobHeight`, `walkBobRate`), nghiêng nhẹ theo hướng đi (`walkTiltDeg`), co giãn nhẹ khi đặt chân, bụi chân mỗi vài bước; khi đứng yên thì "thở" nhẹ (scale Y ±2%); đổi hướng có cú lật/xoay ngắn. Nhịp nảy khớp tốc độ đi.
- [ ] Camera đi theo mượt (`cameraLerp`), dừng ở mép bản đồ, không lộ khoảng đen.
- [ ] Gợi ý phím góc dưới phải: "WASD: đi".
- [ ] Trạng thái cho QA đọc: vị trí nhân vật (ô), cờ `gardenReady`.

**Thông số / ghi chú:** dùng `walkSpeed`, `tileSize`. Thêm vào `gameConfig.ts`: `walkBobHeight` (6 px), `walkBobRate` (bước/giây khớp `walkSpeed`), `walkTiltDeg` (4), `cameraLerp` (0.12), `playerFootHitbox` ([40, 20] px), `gardenMapSize` ([48, 32] ô). Asset: chỉ tile thử cỏ/đất và sprite Tý 4 hướng có sẵn; nhà, cây, ao là hình khối màu theo `palette.ts`.

**Bạn thử thế nào:** chạy `web/start.bat`, mở http://localhost:5173. Bấm W A S D đi một vòng quanh vườn. Phải thấy: camera chạy theo, đụng nhà/cây/ao/rào thì đứng lại, đi ra sau cây thì cây che người. Tự hỏi: đi **nhanh quá hay chậm quá**? Ghi lại để T-009 chỉnh.

---

### T-002 — Chỉ ô bằng chuột, tầm với và cuốc đất (giữ chuột để cuốc cả luống)

**Bước:** 3.3 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-001

**Mục tiêu:** rê chuột thấy ô được chọn, click ô ruộng trong tầm với thì nhân vật cuốc — "chạm ô ruộng" là cảm giác quan trọng nhất của game.

**Điều kiện xong:**
- [ ] Ô dưới con trỏ có **viền sáng** nếu nằm trong tầm `interactRange` tính từ tâm nhân vật; ngoài tầm thì **viền xám** và click không làm gì (GDD §3.3).
- [ ] Click ô ruộng chưa cuốc trong tầm → nhân vật **quay mặt về ô đó**, đứng khựng `actionDuration` giây, ô đổi sang đất đã cuốc (tile đất thử).
- [ ] **Giữ chuột trái và rê** qua các ô → cuốc lần lượt từng ô, mỗi `actionDuration` một ô. Vừa giữ chuột vừa đi WASD dọc luống vẫn cuốc được.
- [ ] Juice tối thiểu (GDD §8): nhân vật nhún, vài hạt bụi (hình tròn nâu), rung màn nhẹ (`screenShakeLight`), tiếng **"bộp"** (`cuoc-dat-1/2`, chọn ngẫu nhiên).
- [ ] Logic ruộng tách riêng thành module thuần (ví dụ `systems/farm.ts`: trạng thái từng ô, hàm `till`) có **unit test**.
- [ ] Trình duyệt không mở menu khi bấm chuột phải trên game.

**Thông số / ghi chú:** dùng `interactRange`, `actionDuration`. Thêm `screenShakeLight` (cường độ 0.05 ô, 0.1 giây — GDD §8). Chưa trừ Sức (T-004).

**Bạn thử thế nào:** mở http://localhost:5173, đi tới vùng ruộng 3×3. Rê chuột qua các ô: gần thì viền sáng, xa thì viền xám. Click một ô: nghe "bộp", ô thành đất nâu. Giữ chuột trái rồi rê qua cả hàng: cuốc liền một mạch. Tự hỏi: tầm với **đủ xa chưa**, động tác **nhanh đã tay chưa**?

---

### T-003 — Gieo, tưới, hái + hotbar 9 ô và gùi tối thiểu

**Bước:** 3.3 · **Ai làm:** game-dev · **Size:** L (1 ngày) · **Cần trước:** T-002

**Mục tiêu:** làm trọn vòng một ô ruộng: cuốc → gieo hạt đang chọn trên hotbar → tưới → (sang ngày, ở T-007) chín → hái vào gùi.

**Điều kiện xong:**
- [ ] Click ô theo bảng GDD §3.3, nhân vật **tự chọn việc**: đã cuốc + trống → gieo **hạt đang chọn**; đã gieo + chưa tưới hôm nay → tưới; cây chín → hái (ô về đất chưa cuốc, `harvestResetsSoil`); cây héo → dọn.
- [ ] Ô hotbar đang chọn không phải hạt → dùng hạt gieo lần trước; hết hạt → bong bóng "hết hạt rồi".
- [ ] Cây vẽ bằng hình khối theo giai đoạn: hạt (chấm nhỏ), đang lớn (mầm), chín (hình to, màu theo loại), ô đã tưới sẫm màu hơn. Prototype có **2 cây**: rau cải (1 ngày), khoai lang (2 ngày) lấy từ `crops.json`.
- [ ] **Hotbar 9 ô** giữa dưới màn (`hotbarSlots`): phím 1–9 và cuộn chuột đổi ô, ô chọn viền vàng, số lượng ở góc ô.
- [ ] **Gùi** `bagSlotsStart` = 18 ô, hàng đầu là hotbar, mỗi ô chồng tối đa `stackMax`. Đồ hái vào ô cùng loại hoặc ô trống đầu tiên. Gùi đầy → không hái, bong bóng "gùi đầy".
- [ ] Phím **E** mở cửa sổ xem gùi (2 hàng × 9, rê chuột thấy tên món). **Chưa cần kéo thả** (Giả định — để chặng 4).
- [ ] Khởi đầu có sẵn hạt `startSeeds` trong hotbar.
- [ ] Juice: tưới có giọt nước + tiếng `tuoi-nuoc-1/2`; hái thì cây bật lên, icon bay vào hotbar, ô hotbar nảy.
- [ ] Để thử ngay không chờ ngủ: **phím thử G (chỉ bản dev)** cho mọi ô đã tưới lớn thêm 1 ngày. Logic gieo/tưới/lớn/hái có unit test.

**Thông số / ghi chú:** dùng `staminaCost*` chưa trừ (T-004). Thêm `bagSlotsStart` (18), `stackMax` (20), `startSeeds` ({ "rau-cai": 6, "khoai-lang": 3 } — id theo `crops.json`), `devCheatsEnabled` (true khi chạy dev, false khi build). Dữ liệu cây: `src/data/crops.json` (đã có).

**Bạn thử thế nào:** mở http://localhost:5173. Bấm phím 1 chọn hạt cải, click ô đã cuốc: thấy chấm hạt. Click lại ô đó: tưới, đất sẫm. Bấm **G** (phím thử): cải chín. Click: cải bay vào hotbar. Bấm **E**: thấy gùi có cải. Thử phím 2 gieo khoai lang, bấm G hai lần mới chín.

---

### T-004 — Thanh Sức, "đuối", ăn khoai bằng chuột phải, bong bóng chửi thề

**Bước:** 3.3 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-003

**Mục tiêu:** mỗi việc tốn Sức, hết Sức thì đi chậm và không làm được việc — để thấy "làm được bao nhiêu trong một ngày".

**Điều kiện xong:**
- [ ] Thanh Sức góc trên trái, số "64/100", màu xanh lá → vàng (< 50%) → đỏ (< 20%) (GDD §11).
- [ ] Cuốc −`staminaCostTill`, gieo −`staminaCostPlant`, tưới −`staminaCostWater`, hái/dọn −`staminaCostHarvest`. Đi lại không tốn.
- [ ] Không đủ Sức cho việc → không làm, bong bóng "đuối rồi…".
- [ ] Hết Sức → **đuối**: đi chậm còn `walkSpeed × staminaExhaustedSpeedMultiplier`, viền màn tối nhẹ.
- [ ] **Chuột phải** khi ô hotbar đang chọn là đồ ăn → ăn 1 món: khoai lang sống +8 Sức (không vượt `staminaMax`), chữ "+8 Sức" xanh bay lên. Hạt giống thì chuột phải không làm gì.
- [ ] **Bong bóng chửi thề** (rẻ, làm luôn): lúc vừa chuyển sang đuối luôn hiện 1 câu — "Mả cha cái bụng, réo như trống hội làng!" (story bible §6.3) — bong bóng răng cưa đỏ, lắc nhẹ, hiện `grumbleBubbleSeconds` giây, kèm tiếng `voice-cau-nhau-1/2`. Chỉ chửi 1 lần mỗi lần đuối.
- [ ] Phím thử **F8 (chỉ bản dev)**: −20 Sức.

**Thông số / ghi chú:** dùng `staminaMax`, `staminaCostTill/Plant/Water/Harvest`, `staminaExhaustedSpeedMultiplier`. Thêm `grumbleBubbleSeconds` (2.5). Khoai lang cần `staminaRestore: 8` (dữ liệu món — tạo `items.json` tối thiểu nếu chưa có).

**Bạn thử thế nào:** mở http://localhost:5173. Cuốc vài ô, thấy thanh Sức tụt. Bấm **F8** vài lần tới khi hết Sức: nhân vật chửi bằng bong bóng đỏ, đi chậm hẳn, click ruộng thì hiện "đuối rồi…". Chọn ô hotbar có khoai, **chuột phải**: Sức tăng 8.

---

### T-005 — Đồng hồ ngày trên HUD, trời tối dần, tạm dừng (Esc / chuyển tab)

**Bước:** 3.3 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-001

**Mục tiêu:** ngày trôi từ 6h tới 24h trong 10 phút thật, trời đổi màu theo giờ, game tự dừng khi bạn rời tab.

**Điều kiện xong:**
- [ ] HUD góc trên phải: "Ngày 1 · Mùa nắng" + đồng hồ "14:30" + icon mặt trời/trăng (hình khối). Dùng `systems/time.ts` có sẵn.
- [ ] 6h → 24h trong `dayLengthSeconds`. Đồng hồ **dừng** khi mở gùi (E), cửa sổ tạm dừng, các cửa sổ sau này (thùng bán, tổng kết).
- [ ] Lớp màu trời phủ toàn màn: sáng 6–11h, trưa/chiều 11–17h, hoàng hôn 17–19h, tối 19–24h (GDD §3.1), chuyển mượt, HUD không bị phủ.
- [ ] Từ `passOutWarnHour` (23h) đồng hồ nhấp nháy đỏ.
- [ ] **Esc** mở cửa sổ Tạm dừng (Tiếp tục, ghi chú "Đã tạm dừng"); Esc lần nữa đóng.
- [ ] **Chuyển tab / Alt+Tab / thu nhỏ trình duyệt** → tự mở Tạm dừng (`pauseOnFocusLost`); quay lại vẫn đúng giờ, không nhảy giờ.
- [ ] Phím thử **F9 (chỉ bản dev)**: +1 giờ game.
- [ ] Gợi ý phím góc dưới phải cập nhật: "WASD đi · Click làm · 1–9 chọn · E Gùi · Esc Menu".

**Thông số / ghi chú:** dùng `dayLengthSeconds`, `dayStartHour`, `dayEndHour`, `passOutWarnHour`, `pauseOnFocusLost`. Thêm `skyTintMaxAlpha` (0.45 — độ tối lúc nửa đêm). Prototype luôn nắng, chưa có thời tiết (Giả định).

**Bạn thử thế nào:** mở http://localhost:5173. Nhìn đồng hồ góc trên phải chạy (khoảng 33 giây thật = 1 giờ game). Bấm **F9** nhiều lần: trời chiều vàng rồi tối dần; tới 23h đồng hồ nhấp nháy đỏ. Chuyển sang tab khác 10 giây rồi quay lại: game đang tạm dừng, giờ không nhảy. Bấm Esc để chơi tiếp.

---

### T-006 — Thùng bán, tiền và sạp hạt tạm

**Bước:** 3.3 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-003, T-005

**Mục tiêu:** có chỗ bỏ hàng để bán cuối ngày và chỗ mua hạt — khép vòng "trồng → bán → mua hạt → trồng nhiều hơn".

**Điều kiện xong:**
- [ ] HUD góc trên trái có **tiền**: icon xu + số quan, khởi đầu `startMoney`.
- [ ] **Thùng bán** (hình khối cạnh nhà): click khi trong tầm, hoặc phím **F** khi đứng cạnh → cửa sổ 2 lưới: gùi ↔ thùng. Click món để chuyển 1 món, **Shift+click** chuyển cả chồng. Lấy lại được. Dòng "Cuối ngày bán được: 30 quan" tính theo giá gốc. Esc đóng; đồng hồ dừng khi mở.
- [ ] Tiền trong thùng **chưa cộng ngay** — cộng ở cuối ngày (T-007).
- [ ] **Sạp hạt tạm** (Giả định — hình khối "hộp hạt" ở cổng vườn, **không phải NPC**, thay quán chị Thóc cho prototype): click/F → cửa sổ 2 nút "Hạt cải — 4 quan", "Hạt khoai lang — 8 quan" (giá từ `crops.json`). Thiếu tiền thì nút xám. Mua xong hạt vào gùi, tiền giảm, có tiếng `nhat-xu`.
- [ ] Tiền không bao giờ âm (unit test).

**Thông số / ghi chú:** dùng `startMoney` (60). Giá bán: rau cải 10, khoai lang 22 (`crops.json`). Không cần asset mới.

**Bạn thử thế nào:** mở http://localhost:5173. Hái vài cây (dùng phím G cho nhanh). Đi tới thùng bán, bấm **F**: click cải để bỏ vào thùng, thấy dòng "Cuối ngày bán được…". Shift+click để bỏ cả chồng. Đi tới hộp hạt ở cổng, bấm F, mua 1 hạt cải: tiền giảm 4.

---

### T-007 — Ngủ, ngủ gục sau 24h, sang ngày mới (cây lớn, héo) và tổng kết ngày

**Bước:** 3.3 · **Ai làm:** game-dev · **Size:** L (1 ngày) · **Cần trước:** T-004, T-006

**Mục tiêu:** chơi trọn một ngày và bước sang ngày 2 — cây lớn qua đêm, tiền bán được hiện ở màn tổng kết.

**Điều kiện xong:**
- [ ] **Giường** trong nhà: click/F từ `earliestSleepHour` (18h) → hỏi "Đi ngủ?" (Có/Không). Trước 18h: bong bóng "Còn sớm, ngủ gì giờ này".
- [ ] **Ngủ gục**: tới `dayEndHour` (24h) mà chưa ngủ → màn tối dần, nhân vật nằm ra đất, "Zzz" → sáng hôm sau tỉnh dậy **ở nhà** với Sức = `staminaMax × passOutStaminaRatio` (70) và **luôn** có bong bóng chửi: "Mả cha nó, ngủ với muỗi cả đêm, lưng như bị trâu giẫm!" (GDD §3.12). Không mất tiền, không mất đồ.
- [ ] **Qua đêm**: ô đã tưới → cây lớn +1 ngày; ô đã gieo mà không tưới → cộng 1 ngày khát (ô màu khô, lá rũ); khát `unwateredDaysToWither` (2) ngày liền → **héo** (màu xám, click để dọn). Cây chín để đó không hỏng. Mọi ô bỏ trạng thái "đã tưới".
- [ ] Đồ trong thùng bán → bán hết, cộng tiền.
- [ ] **Màn tổng kết ngày** (GDD §7): từng dòng trượt vào — "Bán được: 52 quan" (số đếm lên, tiếng "tách tách" nếu có, không có thì im), "Cây chín sáng nay: 3", cảnh báo "2 ô chưa tưới hôm qua", "Ngủ gục ngoài đồng" nếu có. Nút **"Ngày mới"** (Enter).
- [ ] Ngày mới: 6h, ngày +1, Sức đầy (hoặc 70% nếu ngủ gục), nhân vật đứng cạnh giường.
- [ ] Phím thử G (T-003) gọi chung hàm "qua đêm" với lúc ngủ. Logic qua đêm có unit test (lớn, khát, héo, bán).

**Thông số / ghi chú:** dùng `earliestSleepHour`, `dayEndHour`, `passOutStaminaRatio`, `unwateredDaysToWither`, `harvestResetsSoil`. Không thêm tham số mới.

**Bạn thử thế nào:** mở http://localhost:5173. Gieo và tưới 3 ô cải, bỏ 1 món vào thùng bán. Bấm **F9** tới 18h, vào nhà click giường, chọn "Có": thấy màn tổng kết có tiền bán; bấm Enter → Ngày 2, cải đã chín. Thử lần nữa: không ngủ, F9 tới 24h → nhân vật ngủ gục, sáng ra Sức 70/100 và chửi một câu.

---

### T-008 — Tự lưu trong trình duyệt, F5 vào lại đúng chỗ, đúng giờ

**Bước:** 3.3 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-007

**Mục tiêu:** tắt tab hoặc bấm F5 rồi mở lại vẫn chơi tiếp đúng ngày, đúng giờ, đúng chỗ, ruộng và gùi còn nguyên.

**Điều kiện xong:**
- [ ] Save là một object JSON có số `version` (GDD §12): tên nhân vật, ngày, giờ, Sức, tọa độ, trạng thái từng ô ruộng, gùi + ô hotbar đang chọn, thùng bán, tiền. Ghi vào **localStorage**.
- [ ] Tự lưu: mỗi `autoSaveIntervalSeconds` (30 giây), khi tạm dừng / mất focus, khi đóng tab hoặc F5 (`visibilitychange` / `pagehide`), sau màn tổng kết ngày.
- [ ] Mở game: có save thì nạp lại đúng như cũ; không có thì bắt đầu Ngày 1.
- [ ] Cửa sổ Tạm dừng (Esc) có dòng "Đã lưu lúc 14:30" và nút **"Chơi lại từ đầu"** (hỏi xác nhận) để xóa save khi thử.
- [ ] Save hỏng / sai `version` → không treo game, bắt đầu mới và ghi cảnh báo trong console.
- [ ] Hàm tạo/đọc save có unit test (lưu → đọc ra giống hệt). Cấu trúc save đặt ở chỗ dùng chung được (`web/shared` nếu hợp) để bước 3.4 gửi lên server không phải viết lại.

**Thông số / ghi chú:** dùng `autoSaveIntervalSeconds`. Lưu server: **để bước 3.4**.

**Bạn thử thế nào:** mở http://localhost:5173. Cuốc, gieo vài ô, đi ra góc vườn, nhớ giờ trên đồng hồ. Bấm **F5**: game mở lại, nhân vật đứng đúng chỗ, giờ gần như cũ (lệch không quá 30 giây thật), ruộng và gùi còn nguyên. Esc → "Chơi lại từ đầu" → xác nhận: về Ngày 1.

---

### T-009 — Tinh chỉnh cảm giác chơi theo góp ý của bạn

**Bước:** 3.3 · **Ai làm:** game-planner + game-dev · **Size:** M (3–4h) · **Cần trước:** T-008

**Mục tiêu:** chơi trọn 1–2 ngày, nói cảm giác, đội chỉnh số cho tới khi bạn thấy "làm nông vui".

**Điều kiện xong:**
- [ ] Bạn chơi ít nhất **1 ngày trọn vẹn** (10 phút, không dùng phím thử) và trả lời 5 câu: đi nhanh/chậm? tầm với đủ chưa? động tác có đã tay không? Sức có hết quá sớm/quá muộn? ngày 10 phút dài hay ngắn?
- [ ] `game-planner` ghi góp ý vào `docs/playtests.md` (buổi 0 — tự chơi), quy ra thay đổi tham số cụ thể (tối đa 5–8 thay đổi một lượt).
- [ ] `game-dev` sửa **chỉ trong `gameConfig.ts`** (cần sửa code thì tách task mới); bạn chơi lại xác nhận.
- [ ] Bảng tham số trong GDD cập nhật giá trị mới; thay đổi lớn ghi `D-NNN`.
- [ ] Ghi rõ câu trả lời "làm nông có vui không?": Có / Tạm / Chưa + lý do 1 câu. "Chưa" thì `game-planner` đề xuất 2–3 hướng sửa trước khi sang 3.4.

**Thông số / ghi chú:** nút chỉnh chính: `walkSpeed`, `interactRange`, `actionDuration`, `staminaMax`, `staminaCost*`, `dayLengthSeconds`, `cameraLerp`, `screenShakeLight`.

**Bạn thử thế nào:** mở http://localhost:5173, Esc → "Chơi lại từ đầu". Chơi một ngày như người chơi thật: trồng hết 9 ô, mua hạt, bán đồ, ngủ. Sau đó kể lại bằng lời thường, ví dụ "đi hơi chậm", "cuốc cả luống đã tay", "tới 3h chiều là hết việc".

## Lỗi (bug)

| ID | Mô tả | Mức độ | Trạng thái |
|---|---|---|---|

## Changelog

- 2026-10-09 — Bước 3.2 (D-019): thêm 9 task chặng 3 (T-001 … T-009) cho prototype "một ngày ở Vườn", ước lượng 40–46 giờ ≈ 3 tuần với 15 giờ/tuần.
