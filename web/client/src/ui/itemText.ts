// T-092: chữ trong tooltip món (rê chuột lên ô hotbar / gùi): tên + một dòng phụ "Bán 8 quan · Ăn +8 Sức". Thuần TS.
import { sellPriceOf } from '../systems/economy';
import { itemInfo } from '../systems/items';

export interface ItemTooltipText {
  name: string;
  /** Dòng phụ ('' = không có). */
  detail: string;
}

export function itemTooltipText(id: string): ItemTooltipText {
  const info = itemInfo(id);
  if (!info) return { name: id, detail: '' };
  if (info.kind === 'tool') return { name: info.name, detail: 'Chọn ô này rồi click ruộng để cuốc' };
  if (info.kind === 'seed') return { name: info.name, detail: 'Gieo vào ô đã cuốc · không bán được' };
  const parts: string[] = [];
  const price = sellPriceOf(id);
  if (price !== null) parts.push(`Bán ${price} quan`);
  if (info.staminaRestore > 0) parts.push(`Ăn +${info.staminaRestore} Sức`);
  return { name: info.name, detail: parts.join(' · ') };
}
