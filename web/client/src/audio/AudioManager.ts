// T-026: MỘT chỗ phát mọi âm thanh của game (Phaser Sound). Hai kênh âm lượng Nhạc / Hiệu ứng (systems/audio.ts), cài đặt
// lưu máy (net/settingsLocal.ts). Mỗi game một AudioManager (`AudioManager.of(game)`) — dùng chung cho Vườn, HUD, Sandbox,
// và sống qua "Chơi lại từ đầu" (nhạc không bị ngắt).
//
// - Tiếng ngắn (SFX, giọng, giao diện, jingle): `play(cue)` theo tên trong config/soundCues.ts — chọn biến thể, lệch cao độ,
//   chặn phát chồng quá sfxMaxConcurrent bản, nhân âm lượng kênh.
// - Tiếng lặp nền (nhạc nền + tiếng nền amb-*): người gọi báo "đang muốn nghe gì" mỗi frame qua `update(dt, soundscape)`;
//   ở đây tự đan chéo (crossfade) khi đổi bài, hạ nhạc khi jingle phát, giảm khi Tạm dừng, lặp tiếng ngáy, sấm khi mưa.
// - Trình duyệt chặn âm thanh tới lần bấm phím / chuột đầu tiên (`sound.locked`): lúc đó KHÔNG phát gì (không để tiếng dồn
//   lại rồi bật ra cùng lúc khi mở khoá); mở khoá xong frame sau nhạc nền tự bắt đầu.
import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import { SOUND_CUES, type CueName, type SoundCue } from '../config/soundCues';
import { loadAudioSettings, saveAudioSettings } from '../net/settingsLocal';
import {
  canPlayMore,
  channelVolume,
  clampVolume,
  gapElapsed,
  jitterCents,
  mixVolume,
  percentToCents,
  pickIndex,
  randomGap,
  stepFade,
  stepVolume,
  type AudioChannel,
  type AudioSettings,
  type BedChoice,
} from '../systems/audio';

/** Âm thanh có chỉnh âm lượng (WebAudioSound / HTML5AudioSound / NoAudioSound đều có). */
type VolSound = Phaser.Sound.BaseSound & { volume: number; setVolume(v: number): unknown };

/** Một tiếng lặp nền đang phát (nhạc nền hoặc amb-*). */
interface Bed {
  key: string;
  channel: AudioChannel;
  sound: VolSound;
  /** Hệ số mờ 0–1 (đan chéo) và đích (1 = đang muốn nghe, 0 = đang tắt dần rồi bỏ). */
  fade: number;
  target: 0 | 1;
  /** Hệ số âm lượng muốn (vd nhạc đêm trong nhà ban ngày 0.7) và đang áp (đổi dần, không giật). */
  base: number;
  baseNow: number;
  applied: number;
}

/** Thứ "muốn nghe" lúc này — GardenScene tính từ giờ / khu / Tạm dừng / chuỗi đêm. */
export interface Soundscape {
  music: BedChoice<string> | null;
  ambience: BedChoice<string> | null;
  /** Nhạc + tiếng nền nhân hệ số này (Tạm dừng: pauseMusicVolumeMultiplier). Đổi NGAY, không mờ. */
  bedMultiplier: number;
  /** Đang ngủ / ngủ gục → ngáy lặp. */
  snoring: boolean;
  /** Trời mưa → sấm thỉnh thoảng (thời tiết chưa có — luôn false). */
  raining: boolean;
}

export interface PlayOptions {
  /** Lệch cao độ cố định (cent) thay cho lệch ngẫu nhiên của cue (vd thang hái). */
  detune?: number;
  /** Cộng thêm vào lệch cao độ (cent) — vd tillFinishSfxDetune. */
  detuneOffset?: number;
  /** Nhân thêm âm lượng. */
  volume?: number;
}

/** Một lần phát (QA / debugState). */
export interface Played {
  cue: string;
  key: string;
  detune: number;
  volume: number;
}

export interface AudioDebugState {
  locked: boolean;
  settings: AudioSettings;
  /** Nhạc nền đang muốn nghe (bài đang to dần / đã to) + âm lượng thật; tiếng nền tương tự. */
  music: string | null;
  musicVolume: number | null;
  ambience: string | null;
  ambienceVolume: number | null;
  beds: { key: string; fade: number; volume: number }[];
  /** Hệ số hạ nhạc do jingle (1 = không hạ) + số jingle đang phát. */
  duck: number;
  jingles: number;
  snoring: boolean;
  plays: number;
  skippedConcurrent: number;
  /** Vài lần phát gần nhất (cũ → mới). */
  recent: Played[];
}

const RECENT_MAX = 16;
const managers = new WeakMap<Phaser.Game, AudioManager>();
const nowSeconds = (): number => performance.now() / 1000;

export class AudioManager {
  /** AudioManager của game này (tạo lần đầu gọi). */
  static of(game: Phaser.Game): AudioManager {
    let m = managers.get(game);
    if (!m) {
      m = new AudioManager(game);
      managers.set(game, m);
    }
    return m;
  }

  readonly settings: AudioSettings;
  private readonly beds: Bed[] = [];
  private readonly jingles = new Set<VolSound>();
  private duck = 1;
  private readonly lastAt = new Map<string, number>();
  private readonly recent: Played[] = [];
  private plays = 0;
  private skippedConcurrent = 0;
  private musicEverStarted = false;
  private scape: Soundscape = { music: null, ambience: null, bedMultiplier: 1, snoring: false, raining: false };
  private snoreSound: VolSound | null = null;
  private snoreWait = 0;
  private thunderWait = -1;

  private constructor(private readonly game: Phaser.Game) {
    this.settings = loadAudioSettings({ musicVolume: gameConfig.musicVolume, sfxVolume: gameConfig.sfxVolume });
  }

  private get sound(): Phaser.Sound.BaseSoundManager {
    return this.game.sound;
  }

  /** Âm thanh còn khoá (chưa có lần bấm đầu tiên). */
  get locked(): boolean {
    return this.sound.locked;
  }

  private has(key: string): boolean {
    return this.game.cache.audio.exists(key);
  }

  // ---------------------------------------------------------------- âm lượng kênh

  volumeOf(channel: AudioChannel): number {
    return channelVolume(this.settings, channel);
  }

  /** Đặt âm lượng kênh (0–1), lưu máy, áp ngay cho nhạc / tiếng nền đang phát. */
  setChannelVolume(channel: AudioChannel, v: number): number {
    const value = clampVolume(v);
    if (channel === 'music') this.settings.musicVolume = value;
    else this.settings.sfxVolume = value;
    saveAudioSettings(this.settings);
    this.applyBeds();
    return value;
  }

  /** Nút −/+ : một nấc volumeStep. */
  stepChannel(channel: AudioChannel, dir: 1 | -1): number {
    return this.setChannelVolume(channel, stepVolume(this.volumeOf(channel), dir, gameConfig.volumeStep));
  }

  // ---------------------------------------------------------------- tiếng ngắn

  /** Phát một cue (config/soundCues.ts). Trả về lần phát, hoặc null nếu bị bỏ (đang khoá, thiếu file, quá số bản chồng…). */
  play(cue: CueName, opts: PlayOptions = {}): Played | null {
    return this.playCue(cue, SOUND_CUES[cue], opts)?.played ?? null;
  }

  /** Phát thẳng một khoá (vd gà gáy theo kiểu) — không lệch cao độ, theo kênh `channel`. */
  playKey(key: string, channel: AudioChannel = 'sfx', opts: PlayOptions = {}): Played | null {
    return this.playCue(key, { keys: [key], channel }, opts)?.played ?? null;
  }

  private playCue(name: string, c: SoundCue, opts: PlayOptions): { played: Played; sound: VolSound } | null {
    if (this.locked) return null;
    const t = nowSeconds();
    if (!gapElapsed(t, this.lastAt.get(name), c.minGapSeconds ?? 0)) return null;
    const keys = c.keys.filter((k) => this.has(k));
    if (keys.length === 0) return null;
    // "Cùng một tiếng" = mọi biến thể của cue: đang phát đủ sfxMaxConcurrent bản thì bỏ lần này (không cắt bản đang kêu).
    let playing = 0;
    for (const k of keys) for (const s of this.sound.getAll(k)) if (s.isPlaying) playing++;
    if (!canPlayMore(playing, gameConfig.sfxMaxConcurrent)) {
      this.skippedConcurrent++;
      return null;
    }
    const key = keys[pickIndex(Math.random(), keys.length)];
    const maxCents = c.jitterCents ?? (c.jitter ? percentToCents(gameConfig.sfxPitchJitterPercent) : 0);
    const detune = (opts.detune ?? (maxCents > 0 ? jitterCents(Math.random(), maxCents) : 0)) + (opts.detuneOffset ?? 0);
    const volume = mixVolume(c.volume ?? 1, opts.volume ?? 1, this.volumeOf(c.channel));
    const sound = this.sound.add(key, { volume, detune }) as VolSound;
    sound.once(Phaser.Sound.Events.COMPLETE, () => sound.destroy());
    if (!sound.play()) {
      sound.destroy();
      return null;
    }
    if (c.channel === 'music') {
      // Jingle: nhạc nền nhỏ lại tới khi jingle xong (update hạ / trả dần).
      this.jingles.add(sound);
      sound.once(Phaser.Sound.Events.DESTROY, () => this.jingles.delete(sound));
    }
    this.lastAt.set(name, t);
    const played: Played = { cue: name, key, detune, volume };
    this.plays++;
    this.recent.push(played);
    if (this.recent.length > RECENT_MAX) this.recent.shift();
    return { played, sound };
  }

  // ---------------------------------------------------------------- nhạc nền + tiếng nền

  /** Mỗi frame (kể cả lúc Tạm dừng / chuỗi đêm): đan chéo nhạc, hạ nhạc khi jingle, ngáy lặp, sấm. */
  update(dt: number, scape: Soundscape): void {
    this.scape = scape;
    if (this.locked) return;
    this.syncBed('music', scape.music);
    this.syncBed('sfx', scape.ambience);
    const duckTarget = this.jingles.size > 0 ? gameConfig.jingleMusicDuckMultiplier : 1;
    this.duck = stepFade(this.duck, duckTarget, dt, gameConfig.jingleDuckFadeSeconds);
    for (let i = this.beds.length - 1; i >= 0; i--) {
      const b = this.beds[i];
      const fadeSec = b.channel === 'music' ? gameConfig.musicCrossfadeSeconds : gameConfig.ambienceFadeSeconds;
      b.fade = stepFade(b.fade, b.target, dt, fadeSec);
      b.baseNow = stepFade(b.baseNow, b.base, dt, fadeSec);
      if (b.target === 0 && b.fade <= 0) {
        b.sound.stop();
        b.sound.destroy();
        this.beds.splice(i, 1);
      }
    }
    this.applyBeds();
    this.updateSnore(dt, scape.snoring);
    this.updateThunder(dt, scape.raining);
  }

  /** Bài muốn nghe của kênh: đúng bài thì to dần (đích 1), bài khác cùng kênh nhỏ dần rồi bỏ; chưa có thì bắt đầu. */
  private syncBed(channel: AudioChannel, choice: BedChoice<string> | null): void {
    let found = false;
    for (const b of this.beds) {
      if (b.channel !== channel) continue;
      if (choice && b.key === choice.key) {
        b.target = 1;
        b.base = choice.volume;
        found = true;
      } else {
        b.target = 0;
      }
    }
    if (!choice || found || !this.has(choice.key)) return;
    const sound = this.sound.add(choice.key, { loop: true, volume: 0 }) as VolSound;
    sound.play();
    // Bài nhạc ĐẦU TIÊN của game vào thẳng (không mờ từ im lặng); các lần đổi bài sau mới đan chéo.
    const instant = channel === 'music' && !this.musicEverStarted;
    if (channel === 'music') this.musicEverStarted = true;
    this.beds.push({ key: choice.key, channel, sound, fade: instant ? 1 : 0, target: 1, base: choice.volume, baseNow: choice.volume, applied: -1 });
  }

  /** Áp âm lượng cho tiếng lặp nền (chỉ gọi setVolume khi đổi). */
  private applyBeds(): void {
    for (const b of this.beds) {
      const duck = b.channel === 'music' ? this.duck : 1;
      const v = mixVolume(b.fade, b.baseNow, this.volumeOf(b.channel), this.scape.bedMultiplier, duck);
      if (Math.abs(v - b.applied) < 1e-4) continue;
      b.applied = v;
      b.sound.setVolume(v);
    }
  }

  /** Tiếng ngáy (file 3,8 s, 2 tiếng) lặp lại sau một khoảng nghỉ ngẫu nhiên; thôi ngủ thì không lặp nữa (bản đang kêu kêu nốt). */
  private updateSnore(dt: number, snoring: boolean): void {
    if (!snoring) {
      this.snoreWait = 0;
      return;
    }
    if (this.snoreSound) return;
    this.snoreWait -= dt;
    if (this.snoreWait > 0) return;
    const r = this.playCue('snore', SOUND_CUES.snore, {});
    if (!r) return;
    this.snoreSound = r.sound;
    r.sound.once(Phaser.Sound.Events.DESTROY, () => {
      this.snoreSound = null;
      this.snoreWait = randomGap(Math.random(), gameConfig.snoreGapSeconds);
    });
  }

  /** Mưa: sấm xa (1 trong 2 file) cách nhau ngẫu nhiên thunderGapSeconds. */
  private updateThunder(dt: number, raining: boolean): void {
    if (!raining) {
      this.thunderWait = -1;
      return;
    }
    if (this.thunderWait < 0) this.thunderWait = randomGap(Math.random(), gameConfig.thunderGapSeconds);
    this.thunderWait -= dt;
    if (this.thunderWait > 0) return;
    this.play('thunder');
    this.thunderWait = randomGap(Math.random(), gameConfig.thunderGapSeconds);
  }

  /** Bài nhạc nền đang muốn nghe (đích 1). */
  private mainBed(channel: AudioChannel): Bed | null {
    for (let i = this.beds.length - 1; i >= 0; i--) if (this.beds[i].channel === channel && this.beds[i].target === 1) return this.beds[i];
    return null;
  }

  /** Âm lượng thật của nhạc nền đang muốn nghe (null = chưa phát — còn khoá / thiếu file). */
  musicVolumeNow(): number | null {
    const b = this.mainBed('music');
    return b ? b.sound.volume : null;
  }

  debugState(): AudioDebugState {
    const m = this.mainBed('music');
    const a = this.mainBed('sfx');
    return {
      locked: this.locked,
      settings: { ...this.settings },
      music: m?.key ?? null,
      musicVolume: m ? m.sound.volume : null,
      ambience: a?.key ?? null,
      ambienceVolume: a ? a.sound.volume : null,
      beds: this.beds.map((b) => ({ key: b.key, fade: b.fade, volume: b.sound.volume })),
      duck: this.duck,
      jingles: this.jingles.size,
      snoring: this.scape.snoring,
      plays: this.plays,
      skippedConcurrent: this.skippedConcurrent,
      recent: this.recent.map((p) => ({ ...p })),
    };
  }
}
