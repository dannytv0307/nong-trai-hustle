// T-026: bảng "cue" — mỗi SỰ KIỆN âm thanh trong game (cuốc, ăn, mở cửa sổ…) gọi theo TÊN cue, không gọi khoá file trực
// tiếp. Một cue = các biến thể (chọn ngẫu nhiên), kênh (Nhạc / Hiệu ứng), âm lượng riêng, có lệch cao độ ngẫu nhiên không,
// khoảng nghỉ tối thiểu. Đổi tiếng cho một sự kiện / chỉnh to nhỏ từng tiếng = sửa ở đây (khoá file: config/assets.ts).
// Mức âm gốc của file đã được audio-director chuẩn hoá (audio bible §7–8) nên hầu hết `volume` = 1.
import { gameConfig } from './gameConfig';
import type { AudioChannel } from '../systems/audio';

export interface SoundCue {
  /** Khoá âm thanh (config/assets.ts) — nhiều khoá = biến thể, chọn ngẫu nhiên. */
  keys: readonly string[];
  channel: AudioChannel;
  /** Âm lượng riêng của cue (× âm lượng kênh). Mặc định 1. */
  volume?: number;
  /** Lệch cao độ ngẫu nhiên ± sfxPitchJitterPercent (audio bible §8: tiếng lặp nhiều). */
  jitter?: boolean;
  /** Lệch cao độ ngẫu nhiên tự đặt (cent) — cho cue có số riêng từ trước (cuốc, tưới, gieo). Ưu tiên hơn `jitter`. */
  jitterCents?: number;
  /** Cùng cue không phát lại trong bấy nhiêu giây (tiếng lỗi khi rê chuột qua nhiều ô…). */
  minGapSeconds?: number;
}

const s = (keys: readonly string[], extra: Omit<SoundCue, 'keys' | 'channel'> = {}): SoundCue => ({ keys, channel: 'sfx', ...extra });
const ui = (keys: readonly string[], extra: Omit<SoundCue, 'keys' | 'channel'> = {}): SoundCue => ({ keys, channel: 'sfx', ...extra });
const jingle = (key: string): SoundCue => ({ keys: [key], channel: 'music' });

export const SOUND_CUES = {
  // ---- Làm ruộng ----
  /** Nhát cuốc thường "phập" (AUD-SFX-003) — lệch ±1 nửa cung như từ T-002. */
  till: s(['sfx-cuoc-dat-1', 'sfx-cuoc-dat-2'], { jitterCents: 100 }),
  /** Nhát chốt xong ô (AUD-SFX-103) — file riêng, to sẵn (tillFinishSfxVolumeMultiplier). */
  tillFinish: s(['sfx-cuoc-chot-1', 'sfx-cuoc-chot-2'], { volume: gameConfig.tillFinishSfxVolumeMultiplier, jitterCents: 30 }),
  plant: s(['sfx-gieo-hat-1', 'sfx-gieo-hat-2'], { jitterCents: gameConfig.plantSfxDetuneCents }),
  water: s(['sfx-tuoi-nuoc-1', 'sfx-tuoi-nuoc-2'], { jitterCents: 100 }),
  /** Hái "pop" — KHÔNG random cao độ: cao độ lên dần theo thang (harvestPitchLadderCents), người gọi tự đặt detune. */
  harvest: s(['sfx-hai-cay-1', 'sfx-hai-cay-2']),
  /** Sáng ra thấy cây héo "phù" (AUD-SFX-104a). */
  wither: s(['sfx-cay-heo']),
  /** Dọn cây héo (AUD-SFX-104b). */
  clearWithered: s(['sfx-don-cay-heo-1', 'sfx-don-cay-heo-2'], { jitter: true }),
  /** Đóng cọc rào khi mở ruộng (AUD-SFX-112) — nạp sẵn cho T-044. */
  fenceStake: s(['sfx-dong-coc']),

  // ---- Tiền, thùng, rương ----
  /** Nhận / tạm cả trả tiền (AUD-SFX-002) — mua hạt vẫn mượn tới AUD-SFX-202 (Lô 2). */
  coin: s(['sfx-nhat-xu-1', 'sfx-nhat-xu-2'], { jitterCents: 60 }),
  /** Đếm tiền "tách" ở tổng kết (AUD-SFX-118). */
  countTick: s(['sfx-dem-tien-1', 'sfx-dem-tien-2'], { volume: gameConfig.summaryTickVolume, jitter: true }),
  /** Bỏ đồ vào / lấy ra thúng bán "bịch" (AUD-SFX-113). */
  basket: s(['sfx-thung-bich-1', 'sfx-thung-bich-2'], { jitter: true }),
  chestOpen: s(['sfx-ruong-mo']),
  chestClose: s(['sfx-ruong-dong']),

  // ---- Người: ăn, mệt, ngủ ----
  eat: s(['sfx-an-nhom-nhoam-1', 'sfx-an-nhom-nhoam-2'], { jitter: true }),
  stomach: s(['sfx-bung-reo']),
  curse: s(['sfx-voice-cau-nhau-1', 'sfx-voice-cau-nhau-2']),
  yawn: s(['sfx-voice-ngap']),
  snore: s(['sfx-voice-ngay']),
  /** Nấu ở bếp (AUD-SFX-110) — nạp sẵn, nấu thật ở T-048. */
  cook: s(['sfx-nau-bep']),

  // ---- Đi lại ----
  doorIn: s(['sfx-cua-nha-vao']),
  doorOut: s(['sfx-cua-nha-ra']),
  stepDirt: s(['sfx-buoc-dat-1', 'sfx-buoc-dat-2', 'sfx-buoc-dat-3'], { volume: gameConfig.walkFootstepVolume, jitter: true }),
  stepGrass: s(['sfx-buoc-co-1', 'sfx-buoc-co-2', 'sfx-buoc-co-3'], { volume: gameConfig.walkFootstepVolume, jitter: true }),

  // ---- Trời ----
  /** Sấm xa (AUD-SFX-121), chọn 1 trong 2 — chỉ khi mưa (thời tiết chưa có, hook sẵn). */
  thunder: s(['sfx-sam-xa-1', 'sfx-sam-xa-2']),

  // ---- Nhiệm vụ (nạp sẵn cho T-043) ----
  questDone: s(['sfx-xong-nhiem-vu']),

  // ---- Giao diện (AUD-UI-001…007) ----
  uiClick: ui(['ui-click-1', 'ui-click-2'], { jitter: true }),
  uiHover: ui(['ui-hover']),
  uiOpen: ui(['ui-mo-cua-so']),
  uiClose: ui(['ui-dong-cua-so']),
  uiError: ui(['ui-loi'], { minGapSeconds: 0.25 }),
  uiSlot: ui(['ui-doi-o']),
  uiPick: ui(['ui-nhac-mon']),
  uiDrop: ui(['ui-tha-mon']),

  // ---- Jingle (kênh Nhạc; phát thì nhạc nền nhỏ lại) ----
  jingleDaySummary: jingle('jng-tong-ket-ngay'),
  jingleNewSeason: jingle('jng-dau-mua'),
} as const satisfies Record<string, SoundCue>;

export type CueName = keyof typeof SOUND_CUES;

/** Khoá file gà gáy theo kiểu (systems/audio.ts ROOSTER_KINDS) — gà không random cao độ (giữ chất từng kiểu). */
export const roosterKey = (kind: string): string => `sfx-ga-gay-${kind}`;
