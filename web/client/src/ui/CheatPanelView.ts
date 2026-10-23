// Vẽ bảng Thử (T-041, chỉ bản dev) trên HUD: cửa sổ giấy điệp dùng chung (buildPaperWindow), nhãn từng hàng, nút gỗ
// (UiButton) theo data/cheatPanel.json, dòng trạng thái + dòng báo ở chân. CHỈ VẼ — trạng thái (mở, nút dưới con trỏ, chữ
// từng nút) do GardenScene giữ (`cheatPanelModel`), như các cửa sổ khác. Dựng một lần lúc tạo HUD, mỗi frame chỉ đổi
// chữ / trạng thái nút khi khác lần trước.
import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import { paperText } from '../config/theme';
import { cheatButtonWidths, type CheatRow } from '../systems/cheats';
import { CHEAT_PANEL, cheatButtonSlots, cheatFooterLines, cheatPanelRect, cheatRowTop } from './cheatLayout';
import { WINDOW_CHROME, windowCloseRect } from './hudLayout';
import { buildPaperWindow, setCloseHover, UiButton, type PaperWindow } from './uiKit';
import { buttonState } from './uiSpec';

/** Thứ HUD cần để vẽ bảng (GardenScene tính khi bảng mở). */
export interface CheatPanelModel {
  open: boolean;
  /** Nút dưới con trỏ (chỉ số phẳng), -1 = không. */
  hover: number;
  closeHover: boolean;
  pointerDown: boolean;
  /** Chữ từng nút (đã thay {item}, {on}). */
  labels: readonly string[];
  status: string;
  notice: string;
}

/** Bảng Thử nằm trên các cửa sổ khác (thùng bán 50, tooltip 60), dưới màn tối đêm (80) và Tạm dừng (90). */
const DEPTH_CHEAT = 75;
const BUTTON_STYLE = { ...paperText.button, fontSize: '26px' } as const;

export class CheatPanelView {
  private readonly root: Phaser.GameObjects.Container;
  private readonly chrome: PaperWindow;
  private readonly buttons: UiButton[] = [];
  private readonly status: Phaser.GameObjects.Text;
  private readonly notice: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, rows: readonly CheatRow[]) {
    const { gameWidth: w, gameHeight: h } = gameConfig;
    const p = cheatPanelRect(rows.length);
    this.chrome = buildPaperWindow(scene, p, { closeRect: windowCloseRect(p), screen: { w, h } });
    const parts: Phaser.GameObjects.GameObject[] = [...this.chrome.parts];
    parts.push(scene.add.text(p.x + WINDOW_CHROME.titleX, p.y + WINDOW_CHROME.titleY, 'Bảng Thử (chỉ bản dev)', paperText.title).setOrigin(0, 0.5));
    rows.forEach((row, r) => {
      const y = cheatRowTop(r, rows.length) + CHEAT_PANEL.rowH / 2;
      parts.push(scene.add.text(p.x + CHEAT_PANEL.pad, y, row.label, paperText.body).setOrigin(0, 0.5));
    });
    for (const s of cheatButtonSlots(cheatButtonWidths(rows))) {
      const b = new UiButton(scene, s.rect, rows[s.row].buttons[s.index].label, BUTTON_STYLE);
      this.buttons.push(b);
      parts.push(...b.parts);
    }
    const f = cheatFooterLines(rows.length);
    const cx = p.x + p.w / 2;
    this.status = scene.add.text(cx, f.status, '', { ...paperText.body, fontSize: '24px' }).setOrigin(0.5);
    this.notice = scene.add.text(cx, f.notice, '', { ...paperText.note, fontSize: '26px', fontStyle: 'bold' }).setOrigin(0.5);
    parts.push(this.status, this.notice, scene.add.text(cx, f.hint, 'Esc / F2: đóng · mọi thay đổi tự lưu (F5 vẫn còn)', paperText.note).setOrigin(0.5));
    this.root = scene.add.container(0, 0, parts).setDepth(DEPTH_CHEAT).setVisible(false);
  }

  get visible(): boolean {
    return this.root.visible;
  }

  /** Chữ đang hiện trên các nút (QA). */
  get buttonTexts(): string[] {
    return this.buttons.map((b) => b.label.text);
  }

  get statusText(): string {
    return this.status.text;
  }

  get noticeText(): string {
    return this.notice.text;
  }

  update(m: CheatPanelModel): void {
    this.root.setVisible(m.open);
    if (!m.open) return;
    this.buttons.forEach((b, i) => {
      const label = m.labels[i] ?? '';
      if (b.label.text !== label) b.label.setText(label);
      b.setState(buttonState(true, m.hover === i, m.pointerDown));
    });
    if (this.status.text !== m.status) this.status.setText(m.status);
    if (this.notice.text !== m.notice) this.notice.setText(m.notice);
    setCloseHover(this.chrome.close, m.closeHover, WINDOW_CHROME.closeSize);
  }
}
