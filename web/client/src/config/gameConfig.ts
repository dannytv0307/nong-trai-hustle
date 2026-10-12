// MỌI con số tinh chỉnh gameplay nằm ở đây (GDD §3). Tên trường camelCase khớp bảng GDD,
// để người thiết kế đọc GDD là tìm được ngay. Giá trị = "giá trị khởi điểm", chỉnh ở playtest.
// Không rải số ma thuật trong code gameplay — cần số mới thì thêm vào đây (kèm mục GDD).
import { palette } from './palette';

export const gameConfig = {
  // ---- Màn hình & bản đồ (GDD §4, §12) ----
  /** Độ phân giải tham chiếu (px). Phaser co giãn theo cửa sổ, giữ 16:9. */
  gameWidth: 1920,
  gameHeight: 1080,
  /** 1 ô lưới = 64×64 px. */
  tileSize: 64,

  // ---- 3.1 Đồng hồ ngày, mùa, thời tiết ----
  /** Độ dài một ngày (giây thật), 6h → 24h. */
  dayLengthSeconds: 600,
  /** Giờ thức dậy (giờ game). */
  dayStartHour: 6,
  /** Giờ tự đi ngủ (giờ game). */
  dayEndHour: 24,
  /** Sớm nhất được ngủ để bỏ qua buổi tối (giờ game). */
  earliestSleepHour: 18,
  /** Sang chợ làng bên tốn thêm bao nhiêu phút game. */
  marketTravelGameMinutes: 30,
  /** Thức quá 24h → sáng hôm sau còn tỷ lệ Sức này. */
  passOutStaminaRatio: 0.7,
  /** Từ giờ này đồng hồ HUD nhấp nháy đỏ. */
  passOutWarnHour: 23,
  /** Số ngày mỗi mùa (nắng/mưa luân phiên). */
  daysPerSeason: 4,
  /** Xác suất mưa mỗi ngày trong mùa nắng. */
  rainChanceDrySeason: 0.15,
  /** Xác suất mưa mỗi ngày trong mùa mưa. */
  rainChanceRainySeason: 0.6,
  /** Nhịp tự lưu (giây thật). */
  autoSaveIntervalSeconds: 30,
  /** Chuyển tab / mất focus thì tự tạm dừng. */
  pauseOnFocusLost: true,

  // ---- Đồng hồ HUD, màu trời, Tạm dừng (T-005, GDD §3.1, §11) ----
  /** Độ tối lớn nhất của lớp màu trời (lúc nửa đêm 24h). 0 = không tối, 1 = đen kịt. */
  skyTintMaxAlpha: 0.45,
  /** Giờ bắt đầu từng khung trời (GDD §3.1): sáng 6–11h, trưa/chiều 11–17h, hoàng hôn 17–19h, tối 19–24h. */
  skyPhaseStarts: { midday: 11, dusk: 17, night: 19 },
  /**
   * Các mốc màu trời (giờ tăng dần), giữa hai mốc thì trộn dần → trời đổi màu mượt. `strength` 0–1 nhân với
   * skyTintMaxAlpha. Màu lấy từ palette Art Bible: sớm hơi xanh sương, trưa trong, chiều ngả vàng, hoàng hôn đỏ son,
   * tối chàm đậm dần tới nửa đêm.
   */
  skyTintKeyframes: [
    { hour: 6, color: palette.water, strength: 0.4 },
    { hour: 8, color: palette.gold, strength: 0.12 },
    { hour: 11, color: palette.gold, strength: 0 },
    { hour: 15, color: palette.gold, strength: 0 },
    { hour: 17, color: palette.gold, strength: 0.35 },
    { hour: 18, color: palette.vermilion, strength: 0.5 },
    { hour: 19, color: palette.indigo, strength: 0.62 },
    { hour: 21, color: palette.indigo, strength: 0.82 },
    { hour: 24, color: palette.indigo, strength: 1 },
  ] as readonly { hour: number; color: number; strength: number }[],
  /**
   * Đồng hồ ngày đi theo giây THẬT giữa hai frame, nhưng một frame tính tối đa bấy nhiêu giây (máy đơ / tab vừa quay lại
   * không làm nhảy giờ).
   */
  dayClockMaxStepSeconds: 0.25,
  /** Đồng hồ nhấp nháy đỏ từ passOutWarnHour: số lần nháy mỗi giây. */
  clockBlinkRate: 2,
  /** Phím thử F9 (chỉ bản dev): cộng bấy nhiêu giờ game. */
  devAddHours: 1,
  /** Đang mở cửa sổ Tạm dừng thì nhạc nền nhỏ lại còn tỷ lệ này (0 = tắt hẳn, 1 = không đổi). */
  pauseMusicVolumeMultiplier: 0.35,

  // ---- 3.2 Sức và ăn uống ----
  staminaMax: 100,
  /** Sức mỗi ô cuốc (D-022: 2 → 4, trừ một lần khi XONG ô; bỏ dở không mất). Dùng từ T-004. */
  staminaCostTill: 4,
  staminaCostPlant: 1,
  staminaCostWater: 1,
  staminaCostHarvest: 1,
  staminaCostForage: 2,
  staminaCostChop: 4,
  staminaCostMinigame: 8,
  /** Đuối (hết Sức) thì đi chậm còn hệ số này. */
  staminaExhaustedSpeedMultiplier: 0.5,
  /** Thanh Sức (GDD §11): dưới tỷ lệ này thì vàng, dưới `staminaBarRedBelow` thì đỏ (còn lại xanh lá). */
  staminaBarYellowBelow: 0.5,
  staminaBarRedBelow: 0.2,
  /** Chữ "+8 Sức" / "−4 Sức" bay lên: bao lâu (giây), cao bao nhiêu ô. */
  staminaFloatSeconds: 1,
  staminaFloatRise: 0.6,
  /** BUG-012: chữ cùng loại mới hiện chưa quá bấy nhiêu giây thì gộp thành một số cộng dồn ("+16 Sức"). */
  staminaFloatMergeSeconds: 0.5,
  /** BUG-012: chữ khác loại đang bay gần chỗ xuất phát → chữ mới đặt cao hơn bấy nhiêu ô. */
  staminaFloatStackOffset: 0.45,
  /** Đuối: viền màn tối nhẹ — độ đục mép màn (0–1) và thời gian hiện/tắt dần (giây). */
  exhaustedVignetteAlpha: 0.6,
  exhaustedVignetteFadeSeconds: 0.5,
  /** Phím thử F8 (chỉ bản dev): trừ bấy nhiêu Sức. */
  devStaminaDrain: 20,
  /** Giá một bát cơm (quan). */
  riceCost: 5,
  /** Nấu một món tốn bao nhiêu phút game. */
  cookGameMinutes: 30,
  /** Bếp gạch: món ăn hồi Sức × hệ số này. */
  kitchenUpgradeStaminaMultiplier: 1.5,

  // ---- 3.3 Di chuyển và hành động ----
  /** Tốc độ đi (ô/giây). Đổi sang px/giây = walkSpeed × tileSize. */
  walkSpeed: 4,
  /**
   * Tầm với (ô, tính từ tâm nhân vật). 2.5 = đứng giữa ô với tới ô cách 2 (thẳng) và ô chéo (2,1)
   * (2.24 ô), nhưng không tới góc chéo (2,2) (2.83 ô). Người dùng chỉnh 1.5 → 2.5 sau khi thử T-002.
   */
  interactRange: 2.5,
  /**
   * Thời gian một động tác NHANH (giây): gieo, tưới, hái, dọn (T-003). Cuốc không dùng số này mà dùng
   * `tillStrikesPerPlot` × `tillStrikeSeconds` (D-022).
   */
  actionDuration: 0.4,
  /** Số ô hotbar (phím 1–9). */
  hotbarSlots: 9,

  // ---- Chỉ ô bằng chuột & làm việc trên ô (T-002, GDD §3.3, §8) ----
  /**
   * Điểm "chạm" trong một động tác / một nhát cuốc, theo tỷ lệ thời gian của nó (0–1). 0.5 = giơ cuốc nửa đầu,
   * bổ xuống ở giữa (ô đổi, bụi, "bộp"), nửa sau thu cuốc. 0 = chạm ngay khi bắt đầu.
   */
  actionImpactAt: 0.5,
  /** Giữ chuột rê việc NHANH (T-003): nhớ tối đa bấy nhiêu ô chờ làm. Cuốc dùng `tillQueueMax`. */
  actionQueueMax: 4,
  /** Nhún khi bổ cuốc: độ bẹp scale Y lúc chạm (0.12 = bẹp 12%, phình ngang tương ứng). */
  actionSquash: 0.12,
  /** Giơ cuốc: nhân vật vươn cao thêm bấy nhiêu (tỷ lệ scale Y) trước khi bổ xuống. */
  actionStretch: 0.05,
  /** Số hạt bụi đất văng ra mỗi nhát cuốc. (7 → 9 sau góp ý T-002: bỏ rung nên cho đất văng rõ hơn.) */
  tillDustCount: 9,
  /** Hạt bụi đất sống bao lâu (giây). */
  tillDustLifeSeconds: 0.45,
  /** Tốc độ văng ra của bụi đất (ô/giây). */
  tillDustSpeed: 2.6,
  /** Cuốc đất có rung màn (`screenShakeLight`) không. Tắt sau góp ý T-002: cuốc liền nhiều ô thấy khó chịu. */
  tillScreenShake: false,

  // ---- Cuốc là "việc nặng" ≈ 5 giây/ô (D-022, GDD §3.3a) ----
  /** Cuốc một ô mấy nhát (cuốc gỗ). Sau này lấy từ dữ liệu nông cụ (`ToolData.tillStrikesPerPlot`). */
  tillStrikesPerPlot: 6,
  /** Một nhát cuốc dài bao lâu (giây). Chạm ở `actionImpactAt` của nhát. 6 × 0.85 ≈ 5,1 giây/ô. */
  tillStrikeSeconds: 0.85,
  /** Đất đổi hình mấy nấc trong lúc cuốc (chia đều số nhát): 6 nhát / 3 nấc → đổi sau nhát 2, 4, nhát 6 = xong. */
  tillVisualStages: 3,
  /** Đang cuốc thì nhớ thêm tối đa mấy ô chờ (có số 1/2/3 trên ô). 0 = tắt hàng chờ. */
  tillQueueMax: 3,
  /** Nhát cuối (xong ô): bụi đất nhiều gấp mấy lần nhát thường. */
  tillFinishDustMultiplier: 2,
  /** Nhát cuối: khựng hình bao lâu (giây) — cảm giác "chốt". */
  tillFinishHitStopSeconds: 0.05,
  /** Từ nhát thứ mấy (trong một ô) thì có giọt mồ hôi bay. */
  tillSweatFromStrike: 3,
  /** Ô cuốc dở giữ tiến độ qua đêm (T-007 ngủ, T-008 lưu `tillStrikes`). */
  tillProgressKeepsOvernight: true,
  /** Xong ô cuốc có lầm bầm không (xác suất; bong bóng thường, câu ở data/bubbles.json `tillDoneBarks`). */
  tillDoneBarkChance: 0.25,
  /** Lầm bầm cách nhau ít nhất bao lâu (giây thật — đồng hồ dừng khi game dừng). */
  tillDoneBarkCooldownSeconds: 20,
  /** Thanh tiến độ của ô cuốc dở khi KHÔNG đang cuốc: độ đục (GDD §8 "mờ còn khoảng 50%"). */
  tillProgressIdleAlpha: 0.5,
  /** Nhát cuối: lệch cao độ tiếng chốt (cent, âm = trầm hơn). Tạm dùng file "bộp" tới khi audio có tiếng riêng. */
  tillFinishSfxDetune: -400,
  /** Nhát cuối: tiếng chốt to hơn nhát thường bấy nhiêu lần (vẫn bị chặn ở 1). */
  tillFinishSfxVolumeMultiplier: 1.25,
  /** Nhát cuối: ô "nảy" phóng to thêm bấy nhiêu (0.12 = 12%) trong `tillFinishBounceSeconds`. */
  tillFinishBounceScale: 0.12,
  tillFinishBounceSeconds: 0.22,
  /** Thanh tiến độ lóe sáng rồi tắt khi xong ô (giây). */
  tillFinishFlashSeconds: 0.3,
  /** Mồ hôi: số giọt mỗi nhát, sống bao lâu (giây), bay nhanh bao nhiêu (ô/giây). */
  tillSweatCount: 2,
  tillSweatLifeSeconds: 0.5,
  tillSweatSpeed: 1.6,

  // ---- Viền ô dưới con trỏ (góp ý T-002: viền cũ khó thấy) ----
  /** Độ dày nét viền sáng/xám (px thế giới): trong tầm / ngoài tầm. */
  tileHighlightWidth: [6, 3] as readonly [number, number],
  /**
   * Viền mực lót ngoài + trong nét sáng (px mỗi bên) — tạo tương phản trên mọi nền (cỏ sáng, đất khô, đất cuốc sẫm).
   * Trong tầm / ngoài tầm.
   */
  tileHighlightOutline: [3, 2] as readonly [number, number],
  /** Độ đục viền mực lót: trong tầm / ngoài tầm. */
  tileHighlightOutlineAlpha: [0.95, 0.4] as readonly [number, number],
  /** Nền mờ phủ trong ô (độ đục, 0 = không phủ): trong tầm / ngoài tầm. */
  tileHighlightFillAlpha: [0.3, 0] as readonly [number, number],
  /** Ô trong tầm "thở": số nhịp mỗi giây (0 = đứng yên). Ô ngoài tầm không nhấp nháy. */
  tileHighlightPulseRate: 1.6,
  /** Độ đục thấp nhất khi thở (1 = không đổi). Mới rê vào ô thì bắt đầu từ sáng nhất. */
  tileHighlightPulseMinAlpha: 0.6,

  // ---- Rung màn (GDD §8: nhẹ 0.05 ô / 0.1 s, vừa 0.1 ô / 0.15 s, mạnh 0.2 ô / 0.25 s) ----
  /**
   * Rung nhẹ: biên độ (ô) và thời gian (giây). Giữ cho sự kiện lớn hơn sau này (cuốc không rung nữa
   * — xem `tillScreenShake`).
   */
  screenShakeLight: { amplitudeTiles: 0.05, durationSeconds: 0.1 },

  // ---- Bản đồ Vườn, va chạm, camera (T-001, GDD §5, §12) ----
  /** Kích thước bản đồ Vườn [cột, hàng] (ô). */
  gardenMapSize: [48, 32] as readonly [number, number],
  /** Hộp va chạm ở chân nhân vật [rộng, cao] (px). Nhỏ hơn 1 ô để lách qua cửa dễ. */
  playerFootHitbox: [40, 20] as readonly [number, number],
  /** "Nắn vào cửa": đi thẳng vào vật cản mà lệch mép khe trống ≤ số px này thì tự trượt vào khe. */
  cornerNudgePx: 16,
  /** Hộp va chạm gốc cây [rộng, cao] (px) — chỉ gốc chặn, tán cây đi ra sau được. */
  treeTrunkHitbox: [36, 22] as readonly [number, number],
  /**
   * Phóng camera trong Vườn. 1 = mỗi ô đúng 64px trên màn 1080p (thấy 30×17 ô, nhân vật hơi nhỏ).
   * 1.5 = ô hiện 96px, nhân vật 96×144px, vẫn thấy 20×11 ô — đủ nhìn quanh ruộng.
   */
  cameraZoom: 1.5,
  /** Đứng sau cây thì tán cây mờ còn độ đục này (0–1) để vẫn thấy nhân vật. */
  treeFadeAlpha: 0.55,
  /** Độ mượt camera bám theo (0–1 mỗi frame). Nhỏ = trễ/mềm hơn, 1 = dính chặt. */
  cameraLerp: 0.12,

  // ---- Hoạt ảnh đi (D-020 đã sửa: khung thật ART-CHR-004/005/006 + vài hiệu ứng bằng code) ----
  /** Đi lên/xuống: số khung của chu trình bước (ART-CHR-004). */
  walkVerticalFrames: 4,
  /**
   * Đi lên/xuống: khung/giây khi đi đủ tốc độ `walkSpeed`. 8 khung/giây = 2 vòng/giây
   * = 4 lần chạm gót/giây → sải 1 ô/bước ở walkSpeed 4.
   */
  walkVerticalFrameRate: 8,
  /** Đi lên/xuống: khung chạm gót (tung bụi). */
  walkVerticalContactFrames: [0, 2] as readonly number[],
  /** Đi trái/phải: số khung của chu trình bước (ART-CHR-005, profile 6 khung). */
  walkSideFrames: 6,
  /**
   * Đi trái/phải: khung/giây khi đi đủ tốc độ (art gợi ý 9–12). 12 khung/giây = 2 vòng/giây
   * = 4 lần chạm gót/giây — cùng nhịp chân với đi dọc, sải 1 ô/bước. Chậm hơn (10) thì sải 1.2 ô,
   * chân trông "trượt" nhiều hơn. Đi chậm (đuối, trượt dọc tường) thì khung tự chậm theo tốc độ thật.
   */
  walkSideFrameRate: 12,
  /** Đi trái/phải: khung chạm gót (khung 1 và 4 trong art = chỉ số 0 và 3). */
  walkSideContactFrames: [0, 3] as readonly number[],
  /** Độ mượt khi đo tốc độ thật để chỉnh nhịp khung (1/giây). Lớn = phản ứng nhanh, dễ giật. */
  walkSpeedSmoothing: 20,
  /** Đi lên: nhích sprite lên mấy px ở khung nhấc chân (dải hướng lên ít chuyển động dọc). */
  walkUpBobPx: 1,
  /** Tốc độ chuyển giữa đứng ↔ đi (1/giây) — cho nhịp thở hiện/tắt mềm. */
  walkBlendRate: 12,
  /** Cứ mấy lần chạm gót thì tung bụi chân một lần. */
  walkDustEverySteps: 2,
  /** Số đốm bụi có sẵn trong pool (tái dùng, không tạo mới khi đang chơi). */
  walkDustPoolSize: 12,
  /** Đốm bụi sống bao lâu (giây). */
  walkDustLifeSeconds: 0.45,
  /** Thở khi đứng yên: biên độ scale Y (0.02 = ±2%). */
  idleBreathScale: 0.02,
  /** Nhịp thở (lần/giây). */
  idleBreathRate: 0.5,
  /**
   * Đổi hướng: mỗi khung xoay chéo 3/4 (ART-CHR-006) hiện bao lâu (mili-giây; art gợi ý 60–80).
   * Quay 90° = 1 khung, quay 180° = 2 khung nối tiếp. 0 = tắt, đổi hình thẳng.
   */
  turnFrameMs: 70,

  // ---- 3.4 Ruộng và cây trồng ----
  startPlots: 9,
  plotExpansionSize: 3,
  /** Giá lần mua thêm ruộng thứ 1…5 (quan). */
  plotExpansionCosts: [40, 100, 180, 280, 400] as readonly number[],
  maxPlots: 24,
  /** Bỏ bao nhiêu ngày liên tiếp không tưới thì cây héo. */
  unwateredDaysToWither: 2,
  /** Hái xong ô trở về đất chưa cuốc. */
  harvestResetsSoil: true,

  // ---- 3.9 Kinh tế: tiền, thùng bán, sạp hạt tạm (T-006) ----
  /** Tiền khởi đầu (quan). Đủ mua hạt cho 9 ô + vài bát cơm. Tiền không bao giờ âm. */
  startMoney: 60,
  /** Số ô của thùng bán (mỗi ô chồng tối đa stackMax như gùi). 18 = 2 hàng × 9, bằng gùi. */
  sellBoxSlots: 18,
  /**
   * Phím F mở thùng bán / sạp hạt khi "đứng cạnh": khoảng cách từ tâm hộp chân tới MÉP vật ≤ bấy nhiêu ô
   * (1 = đứng ở ô kề, kể cả ô chéo). Click thì dùng interactRange như ô ruộng.
   */
  interactKeyRange: 1,
  /** Sạp hạt: Shift+click mua tối đa bấy nhiêu hạt một lần (thiếu tiền / gùi gần đầy thì mua được bao nhiêu hay bấy nhiêu). */
  seedBulkBuyCount: 5,
  /** Dòng báo trong cửa sổ thùng bán / sạp hạt ("Hạt giống không bán được", "Không đủ tiền"…) hiện bao lâu (giây). */
  shopNoticeSeconds: 2.2,
  /** Chữ "−4 quan" / "+30 quan" bay cạnh ô tiền trên HUD: bao lâu (giây), bay lên bao nhiêu px. */
  moneyFloatSeconds: 1.2,
  moneyFloatRisePx: 20,

  // ---- Gùi + hotbar (T-003, GDD §3.3, §3.9) ----
  /** Số ô gùi lúc đầu (2 hàng × 9, hàng 1 = hotbar). */
  bagSlotsStart: 18,
  /** Mỗi ô chồng tối đa bấy nhiêu món cùng loại. */
  stackMax: 20,
  /** Hạt có sẵn lúc bắt đầu (id cây trong crops.json → số hạt), xếp vào hotbar theo thứ tự này từ ô 1. */
  startSeeds: { 'rau-cai': 6, 'khoai-lang': 3 } as Readonly<Record<string, number>>,
  /** Phím thử (G: qua đêm, F8: −20 Sức…) chỉ bật khi chạy dev (`npm run dev`), tắt ở bản build. */
  devCheatsEnabled: import.meta.env.DEV,

  // ---- Gieo, tưới, hái: hiệu ứng (T-003, GDD §8) ----
  /** Bong bóng chữ trên đầu nhân vật ("hết hạt rồi", "gùi đầy") hiện bao lâu (giây). */
  bubbleSeconds: 1.8,
  /** Bong bóng chửi thề (răng cưa đỏ, lắc — GDD §3.12) hiện bao lâu (giây). */
  grumbleBubbleSeconds: 2.5,
  /** Bong bóng chửi thề lắc ngang: biên độ (px thế giới) và số lần lắc mỗi giây. */
  grumbleShakePx: 3,
  grumbleShakeRate: 9,
  /** Tưới: số giọt nước bắn ra, sống bao lâu (giây). */
  waterDropCount: 10,
  waterDropLifeSeconds: 0.5,
  /** Gieo: số hạt rơi xuống ô. */
  plantSeedDropCount: 4,
  /** Ô đã tưới phủ màu sẫm bấy nhiêu (độ đục lớp mực). */
  wateredSoilAlpha: 0.32,
  /** Cây khát (hôm qua không tưới) — ô phủ màu đất khô bấy nhiêu. */
  thirstySoilAlpha: 0.35,
  /** Hái: cây bật lên cao bấy nhiêu ô và mờ dần trong `harvestPopSeconds`. */
  harvestPopHeight: 0.7,
  harvestPopSeconds: 0.35,
  /** Hái: icon bay từ ô ruộng vào ô hotbar/gùi mất bao lâu (giây). */
  harvestFlySeconds: 0.5,
  /** Ô hotbar "nảy" khi nhận đồ: phóng thêm bấy nhiêu (0.2 = 20%) trong `hotbarBounceSeconds`. */
  hotbarBounceScale: 0.2,
  hotbarBounceSeconds: 0.22,
  /** Gieo: tiếng "lách tách" (AUD-SFX-101) lệch cao độ ngẫu nhiên ± bấy nhiêu cent (70 ≈ ±4%) cho đỡ lặp. */
  plantSfxDetuneCents: 70,
  /**
   * Hái liên tiếp: tiếng "pop" (AUD-SFX-102, không random cao độ) lên dần theo thang ngũ cung (cent so với nốt gốc C5),
   * tới nấc cao nhất thì giữ.
   */
  harvestPitchLadderCents: [0, 200, 400, 700, 900, 1200] as readonly number[],
  /** Ngừng hái quá bấy nhiêu giây (giờ game) thì tiếng hái về nấc đầu. */
  harvestPitchResetSeconds: 1.2,

  // ---- Cuộn chuột chọn ô hotbar (BUG-009) ----
  /** Cộng dồn deltaY (px) đủ bấy nhiêu mới tính 1 nấc. Chuột thường ~100 px/nấc → 1 ô; touchpad vuốt nhẹ không nhảy vèo. */
  wheelStepDelta: 100,

  // ---- Nhân vật / tên (GDD §11 Đặt tên) ----
  /** Tên mặc định của nhân vật chính ({ten}). */
  defaultPlayerName: 'Tý',
  /** Tên tối đa bao nhiêu ký tự. */
  playerNameMaxLength: 10,

  // ---- Âm thanh (Cài đặt mặc định, GDD §11) ----
  /** Âm lượng nhạc nền mặc định (0–1). */
  musicVolume: 0.6,
  /** Âm lượng SFX mặc định (0–1). */
  sfxVolume: 0.8,

  // ---- Mạng ----
  /** Quá thời gian này (ms) mà server chưa trả lời thì coi như mất kết nối. */
  apiTimeoutMs: 3000,
} as const;

export type GameConfig = typeof gameConfig;
