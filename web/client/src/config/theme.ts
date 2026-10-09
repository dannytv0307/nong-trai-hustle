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
