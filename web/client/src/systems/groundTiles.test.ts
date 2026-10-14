import { describe, expect, it } from 'vitest';
import { gardenLayout } from './garden';
import {
  buildGroundKinds,
  concaveCorners,
  coreCell,
  CORNER_NE,
  CORNER_NW,
  CORNER_SE,
  CORNER_SW,
  EDGE_E,
  EDGE_N,
  EDGE_S,
  EDGE_W,
  grassEdgeMask,
  soilLookIndex,
  SOIL_TEXTURES,
  tilledEdgeMask,
  type GroundKind,
} from './groundTiles';
import type { FarmPlot } from './farm';

/** Lưới nhỏ từ chuỗi: '.' cỏ, 'p' lối, 'y' sân, 's' ruộng. */
function grid(rows: string[]): GroundKind[][] {
  const map: Record<string, GroundKind> = { '.': 'grass', p: 'path', y: 'yard', s: 'soil' };
  return rows.map((r) => [...r].map((c) => map[c]));
}

const plot = (over: Partial<FarmPlot>): FarmPlot => ({ x: 0, y: 0, soil: 'untilled', tillStrikes: 0, crop: null, watered: false, ...over });

describe('coreCell — mảnh texture 4×4 theo toạ độ', () => {
  it('(y % 4) * 4 + (x % 4), lặp lại mỗi 4 ô', () => {
    expect(coreCell(0, 0)).toBe(0);
    expect(coreCell(3, 0)).toBe(3);
    expect(coreCell(0, 1)).toBe(4);
    expect(coreCell(13, 14)).toBe(2 * 4 + 1);
    expect(coreCell(4, 4)).toBe(0);
  });
});

describe('grassEdgeMask — mép cỏ trên ô đất (N1 E2 S4 W8)', () => {
  const g = grid([
    '.....', //
    '.ppp.',
    '.pys.',
    '.....',
  ]);
  it('ô cỏ không có mép', () => {
    expect(grassEdgeMask(g, 0, 0)).toBe(0);
  });
  it('góc trên-trái của khối đất: giáp cỏ phía bắc + tây', () => {
    expect(grassEdgeMask(g, 1, 1)).toBe(EDGE_N | EDGE_W);
  });
  it('lối ↔ sân ↔ ruộng không có mép giữa nhau', () => {
    expect(grassEdgeMask(g, 2, 2)).toBe(EDGE_S); // sân: chỉ giáp cỏ phía nam
    expect(grassEdgeMask(g, 3, 2)).toBe(EDGE_E | EDGE_S); // ruộng
  });
  it('ngoài mép bản đồ coi như cùng loại (không viền)', () => {
    const edge = grid(['pp', 'p.']);
    expect(grassEdgeMask(edge, 0, 0)).toBe(0);
    expect(grassEdgeMask(edge, 1, 0)).toBe(EDGE_S);
  });
  it('lối 1 ô giữa cỏ: đủ 4 cạnh = 15', () => {
    expect(grassEdgeMask(grid(['...', '.p.', '...']), 1, 1)).toBe(15);
  });
});

describe('concaveCorners — góc lõm', () => {
  it('chỗ lối rẽ: ô chéo là cỏ, hai ô kề không phải cỏ', () => {
    // Lối dọc ở cột 1 + nhánh sang phải ở hàng 1 → ô (1,1) có góc lõm đông-bắc và đông-nam (chỗ rẽ).
    const g = grid([
      '.p..', //
      '.ppp',
      '.p..',
    ]);
    expect(concaveCorners(g, 1, 1)).toEqual([CORNER_NE, CORNER_SE]);
    expect(concaveCorners(g, 1, 0)).toEqual([]);
  });
  it('ô cỏ không có góc; đủ 4 góc khi bốn ô chéo là cỏ', () => {
    const g = grid(['.p.', 'ppp', '.p.']);
    expect(concaveCorners(g, 0, 0)).toEqual([]);
    expect(concaveCorners(g, 1, 1)).toEqual([CORNER_NW, CORNER_NE, CORNER_SW, CORNER_SE]);
  });
});

describe('tilledEdgeMask — viền luống trên ô đã cuốc', () => {
  // Ruộng 3×1: ô 0 và 1 đã cuốc, ô 2 chưa; ngoài ruộng là cỏ.
  const tilled = new Set(['0,0', '1,0']);
  const at = (x: number, y: number): boolean | null => {
    if (x < -5 || x > 5 || y < -5 || y > 5) return null;
    return tilled.has(`${x},${y}`);
  };
  it('ô chưa cuốc không có viền luống', () => {
    expect(tilledEdgeMask(2, 0, at)).toBe(0);
  });
  it('hai ô đã cuốc cạnh nhau nối liền (không viền ở cạnh chung)', () => {
    expect(tilledEdgeMask(0, 0, at)).toBe(EDGE_N | EDGE_S | EDGE_W);
    expect(tilledEdgeMask(1, 0, at)).toBe(EDGE_N | EDGE_E | EDGE_S);
  });
  it('ngoài bản đồ coi như cùng loại', () => {
    const edgeAt = (x: number, y: number): boolean | null => (x < 0 || y < 0 ? null : x === 0 && y === 0);
    expect(tilledEdgeMask(0, 0, edgeAt)).toBe(EDGE_E | EDGE_S);
  });
});

describe('soilLookIndex — lõi đất theo nấc cuốc (6 nhát / 3 nấc)', () => {
  const look = (p: FarmPlot) => SOIL_TEXTURES[soilLookIndex(p, 6, 3)];
  it('0–1 nhát cỏ khô, 2–3 vỡ cỏ, 4–5 lổn nhổn', () => {
    expect(look(plot({ tillStrikes: 0 }))).toBe('soil-dry');
    expect(look(plot({ tillStrikes: 1 }))).toBe('soil-dry');
    expect(look(plot({ tillStrikes: 2 }))).toBe('soil-till-1');
    expect(look(plot({ tillStrikes: 3 }))).toBe('soil-till-1');
    expect(look(plot({ tillStrikes: 4 }))).toBe('soil-till-2');
    expect(look(plot({ tillStrikes: 5 }))).toBe('soil-till-2');
  });
  it('đã cuốc → đất tơi; đã tưới → lõi sẫm', () => {
    expect(look(plot({ soil: 'tilled', tillStrikes: 6 }))).toBe('soil-tilled');
    expect(look(plot({ soil: 'tilled', tillStrikes: 6, watered: true }))).toBe('soil-watered');
  });
  it('số nấc khác 3 vẫn ra hình hợp lệ', () => {
    expect(SOIL_TEXTURES[soilLookIndex(plot({ tillStrikes: 1 }), 4, 2)]).toBe('soil-dry');
    expect(SOIL_TEXTURES[soilLookIndex(plot({ tillStrikes: 2 }), 4, 2)]).toBe('soil-till-1');
    expect(SOIL_TEXTURES[soilLookIndex(plot({ tillStrikes: 3 }), 8, 4)]).toBe('soil-till-1');
    expect(SOIL_TEXTURES[soilLookIndex(plot({ tillStrikes: 6 }), 8, 4)]).toBe('soil-till-2');
  });
});

describe('Vườn prototype (D-035) — lối đất nện nối nhà, ruộng, thùng bán, sạp hạt', () => {
  const g = buildGroundKinds(gardenLayout);
  const L = gardenLayout;
  it('lối dọc, sân trước cửa, nhánh tới sạp hạt là đất; ruộng là ruộng', () => {
    expect(g[20][L.path.x]).toBe('path');
    expect(g[11][8]).toBe('yard');
    expect(g[12][18]).toBe('yard');
    expect(g[26][12]).toBe('path');
    expect(g[L.plots.y][L.plots.x]).toBe('soil');
    expect(g[20][30]).toBe('grass');
  });
  it('thùng bán đứng trên sân, ruộng giáp sân (không bị cỏ chắn)', () => {
    expect(g[L.sellBox.y][L.sellBox.x]).toBe('yard');
    expect(g[L.plots.y - 1][L.plots.x]).toBe('yard');
  });
  it('nền dưới chân đế nhà là đất (bậc cửa nối thẳng ra sân, không có mép cỏ dọc chân thềm)', () => {
    const d = L.houseDoor;
    expect(g[d.y][d.x]).toBe('path');
    expect(grassEdgeMask(g, d.x, d.y + 1)).toBe(0);
  });
  it('nhánh lối chạm quầy hạt (chân đế)', () => {
    expect(g[L.seedStallFoot.y][L.seedStallFoot.x - 1]).toBe('path');
  });
});
