// "Qua đêm" (T-007, GDD §3.1, §3.4, §3.12, §7) — MỘT hàm thuần dùng chung cho mọi cách sang ngày mới:
// ngủ ở giường, ngủ gục lúc 24h, và phím thử G (bản dev). Thuần TS (không Phaser) → unit test được.
// Thứ tự trong một đêm:
//   1. đếm số ô đã gieo mà hôm qua không tưới (cho dòng cảnh báo ở màn tổng kết);
//   2. ruộng qua đêm (farm.advanceDay: lớn / khát / héo, bỏ "đã tưới", giữ nhát cuốc dở — D-022);
//   3. bán hết thùng bán, cộng tiền (economy.sellBoxContents);
//   4. sang ngày mới: ngày +1, đồng hồ về dayStartHour (6:00);
//   5. Sức: ngủ đàng hoàng = đầy; ngủ gục = staminaMax × passOutStaminaRatio (70). Sức > 0 nên hết "đuối".
// Không mất tiền, không mất đồ trong gùi (gùi không bị đụng tới).
import { advanceDay, type FarmState, type GrowDaysOf, type OvernightReport } from './farm';
import { sellBoxContents, type SaleReport, type Wallet } from './economy';
import type { Inventory } from './inventory';
import { setStamina, type StaminaState } from './stamina';
import { seasonOf, type DayClockState, type Season } from './time';

/** Vì sao qua đêm: ngủ ở giường, ngủ gục 24h, phím thử G. */
export type OvernightCause = 'sleep' | 'passout' | 'devG';

export interface OvernightConfig {
  growDaysOf: GrowDaysOf;
  unwateredDaysToWither: number;
  tillProgressKeepsOvernight: boolean;
  passOutStaminaRatio: number;
  daysPerSeason: number;
}

/** Mọi trạng thái bị đổi qua đêm (hàm sửa thẳng các object này). */
export interface OvernightWorld {
  farm: FarmState;
  sellBox: Inventory;
  wallet: Wallet;
  clock: DayClockState;
  stamina: StaminaState;
}

/** Kết quả một đêm — đủ số liệu cho màn tổng kết ngày (GDD §7) và cho QA. */
export interface OvernightSummary {
  cause: OvernightCause;
  /** Ngủ gục ngoài đồng (cause === 'passout'). */
  passedOut: boolean;
  /** Ngày vừa hết và ngày mới. */
  dayEnded: number;
  newDay: number;
  /** Mùa của ngày mới; ngày mới là ngày đầu một mùa khác hôm qua (vd ngày 5 → "Mùa mưa tới rồi!"). */
  newSeason: Season;
  seasonChanged: boolean;
  /** Bán thùng: tổng tiền, số món, từng dòng (gộp theo loại). */
  sale: SaleReport;
  /** Số cây vừa chín sáng nay (đủ ngày nhờ được tưới hôm qua). */
  ripenedThisMorning: number;
  /** Số ô có cây đang lớn mà hôm qua không tưới (gồm cả cây vừa héo đêm nay). */
  unwateredYesterday: number;
  /** Số cây vừa héo đêm nay. */
  witheredTonight: number;
  /** Chi tiết ruộng (lớn / chín / khát / héo). */
  farm: OvernightReport;
  /** Sức sáng nay (đầy, hoặc 70 nếu ngủ gục). */
  staminaAfter: number;
}

/** Giường: từ `earliestSleepHour` (18h) trở đi mới được ngủ (GDD §3.1); trước đó bong bóng "Còn sớm…". */
export function canSleepAt(hour: number, earliestSleepHour: number): boolean {
  return hour >= earliestSleepHour;
}

/** Sức sáng nay: ngủ gục → max × tỷ lệ (làm tròn xuống, ít nhất 1 để không "đuối" ngay khi tỉnh); còn lại → đầy. */
export function morningStamina(max: number, passedOut: boolean, passOutRatio: number): number {
  if (!passedOut) return max;
  return Math.max(1, Math.floor(max * passOutRatio));
}

/** Số ô có cây đang lớn (chưa chín, chưa héo) mà chưa được tưới hôm nay — tính TRƯỚC khi qua đêm. */
export function countUnwateredGrowing(farm: FarmState, growDaysOf: GrowDaysOf): number {
  let n = 0;
  for (const p of farm.plots) {
    const c = p.crop;
    if (c && !c.withered && c.age < growDaysOf(c.cropId) && !p.watered) n++;
  }
  return n;
}

/** Qua một đêm (xem chú thích đầu file). Sửa thẳng `world`, trả về số liệu cho màn tổng kết. */
export function runOvernight(world: OvernightWorld, cause: OvernightCause, cfg: OvernightConfig): OvernightSummary {
  const unwateredYesterday = countUnwateredGrowing(world.farm, cfg.growDaysOf);
  const farm = advanceDay(world.farm, {
    growDaysOf: cfg.growDaysOf,
    unwateredDaysToWither: cfg.unwateredDaysToWither,
    tillProgressKeepsOvernight: cfg.tillProgressKeepsOvernight,
  });
  const sale = sellBoxContents(world.sellBox, world.wallet);

  const dayEnded = world.clock.day;
  const newDay = dayEnded + 1;
  world.clock.day = newDay;
  world.clock.elapsedSeconds = 0;
  const newSeason = seasonOf(newDay, cfg.daysPerSeason);

  const passedOut = cause === 'passout';
  setStamina(world.stamina, morningStamina(world.stamina.max, passedOut, cfg.passOutStaminaRatio));

  return {
    cause,
    passedOut,
    dayEnded,
    newDay,
    newSeason,
    seasonChanged: newSeason !== seasonOf(dayEnded, cfg.daysPerSeason),
    sale,
    ripenedThisMorning: farm.ripened,
    unwateredYesterday,
    witheredTonight: farm.withered,
    farm,
    staminaAfter: world.stamina.current,
  };
}
