// MỌI con số tinh chỉnh gameplay nằm ở đây (GDD §3). Tên trường camelCase khớp bảng GDD,
// để người thiết kế đọc GDD là tìm được ngay. Giá trị = "giá trị khởi điểm", chỉnh ở playtest.
// Không rải số ma thuật trong code gameplay — cần số mới thì thêm vào đây (kèm mục GDD).

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

  // ---- 3.2 Sức và ăn uống ----
  staminaMax: 100,
  staminaCostTill: 2,
  staminaCostPlant: 1,
  staminaCostWater: 1,
  staminaCostHarvest: 1,
  staminaCostForage: 2,
  staminaCostChop: 4,
  staminaCostMinigame: 8,
  /** Đuối (hết Sức) thì đi chậm còn hệ số này. */
  staminaExhaustedSpeedMultiplier: 0.5,
  /** Giá một bát cơm (quan). */
  riceCost: 5,
  /** Nấu một món tốn bao nhiêu phút game. */
  cookGameMinutes: 30,
  /** Bếp gạch: món ăn hồi Sức × hệ số này. */
  kitchenUpgradeStaminaMultiplier: 1.5,

  // ---- 3.3 Di chuyển và hành động ----
  /** Tốc độ đi (ô/giây). Đổi sang px/giây = walkSpeed × tileSize. */
  walkSpeed: 4,
  /** Tầm với (ô, tính từ tâm nhân vật). */
  interactRange: 1.5,
  /** Thời gian một động tác (giây). */
  actionDuration: 0.4,
  /** Số ô hotbar (phím 1–9). */
  hotbarSlots: 9,

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
