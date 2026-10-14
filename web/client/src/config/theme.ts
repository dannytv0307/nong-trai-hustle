// Kiểu chữ dùng chung cho UI (GDD §11: chữ thân ≥ 24px ở 1080p).
// Font: tạm dùng font hệ thống có đủ dấu tiếng Việt. Khi tải font web (vd "Be Vietnam Pro")
// vào public/fonts thì chỉ cần đặt tên nó lên đầu danh sách này.
import { cssColor } from './palette';

export const uiFontFamily = '"Be Vietnam Pro", "Segoe UI", "Helvetica Neue", Arial, sans-serif';

export const textStyles = {
  title: {
    fontFamily: uiFontFamily,
    fontSize: '84px',
    fontStyle: 'bold',
    color: cssColor('gold'),
    stroke: cssColor('ink'),
    strokeThickness: 10,
  },
  subtitle: {
    fontFamily: uiFontFamily,
    fontSize: '40px',
    fontStyle: 'bold',
    color: cssColor('paper'),
    stroke: cssColor('ink'),
    strokeThickness: 8,
  },
  body: {
    fontFamily: uiFontFamily,
    fontSize: '26px',
    color: cssColor('paper'),
    stroke: cssColor('ink'),
    strokeThickness: 6,
  },
  nameTag: {
    fontFamily: uiFontFamily,
    fontSize: '24px',
    fontStyle: 'bold',
    color: cssColor('paper'),
    stroke: cssColor('ink'),
    strokeThickness: 6,
  },
} as const;

/**
 * T-092: chữ trên giao diện Lô 1 (ui.json `palette`). Trên giấy điệp (cửa sổ, tooltip, bong bóng): chữ MỰC không viền,
 * dòng phụ nâu đất. Trên gỗ (HUD): chữ trắng điệp viền mực. Chữ ≥ 24px ở 1080p (GDD §11).
 */
export const paperText = {
  title: { fontFamily: uiFontFamily, fontSize: '40px', fontStyle: 'bold', color: cssColor('ink') },
  body: { fontFamily: uiFontFamily, fontSize: '28px', fontStyle: 'bold', color: cssColor('ink') },
  /** Dòng phụ / hướng dẫn chân cửa sổ: nâu đất, chữ thường. */
  note: { fontFamily: uiFontFamily, fontSize: '24px', color: cssColor('earth') },
  button: { fontFamily: uiFontFamily, fontSize: '32px', fontStyle: 'bold', color: cssColor('ink') },
} as const;

export const woodText = {
  body: { fontFamily: uiFontFamily, fontSize: '28px', fontStyle: 'bold', color: cssColor('paper'), stroke: cssColor('ink'), strokeThickness: 5 },
} as const;

/** Số trên ô (phím góc trên-trái, số lượng góc dưới-phải): chữ mực viền trắng điệp. */
export const slotText = {
  key: { fontFamily: uiFontFamily, fontSize: '22px', fontStyle: 'bold', color: cssColor('ink'), stroke: cssColor('paper'), strokeThickness: 4 },
  count: { fontFamily: uiFontFamily, fontSize: '28px', fontStyle: 'bold', color: cssColor('ink'), stroke: cssColor('paper'), strokeThickness: 5 },
} as const;
