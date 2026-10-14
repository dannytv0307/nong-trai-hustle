// T-093: bố cục phòng trong nhà + luật vào / ra cửa + vật tương tác.
import { describe, expect, it } from 'vitest';
import { gameConfig } from '../config/gameConfig';
import { gardenLayout as L, isHouseDoorTile, type Box } from './garden';
import { cellAt, cellCenter, isFreeCell, nearestFreeCell, PathFinder } from './pathfind';
import {
  distanceToRect,
  HOUSE_GAP_TILES,
  HOUSE_TARGETS,
  houseExitSpot,
  houseExitStandSpot,
  houseNavGrid,
  houseObject,
  houseOrigin,
  houseSize,
  houseTargetAt,
  houseTargetInReach,
  isFreeHouseSpot,
  isHouseDoorAt,
  nearestHouseTarget,
  resolveHouseLayout,
  shouldEnterHouse,
  shouldExitHouse,
  type PxRect,
} from './house';
import { interiorSpec } from './props';

const T = gameConfig.tileSize;
const ORIGIN = houseOrigin(L.rows, T);
const H = resolveHouseLayout(ORIGIN, T);
const [FW, FH] = gameConfig.playerFootHitbox;
/** Hộp chân giữa (x, y). */
const feet = (x: number, y: number): Box => ({ left: x - FW / 2, right: x + FW / 2, top: y - FH / 2, bottom: y + FH / 2 });
const overlap = (a: PxRect, b: PxRect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

describe('phòng trong nhà — bố cục (T-093)', () => {
  it('phòng nằm dưới bản đồ Vườn, cách HOUSE_GAP_TILES ô (camera Vườn không bao giờ thấy phòng)', () => {
    expect(ORIGIN).toEqual({ x: 0, y: (L.rows + HOUSE_GAP_TILES) * T });
    expect(H.bounds.y).toBeGreaterThanOrEqual(L.rows * T + T);
  });

  it('ảnh phòng 1280×720 vừa khít khung nhìn ở cameraZoom → camera đứng yên', () => {
    expect(houseSize()).toEqual({ width: 1280, height: 720 });
    expect(H.bounds.w).toBeCloseTo(gameConfig.gameWidth / gameConfig.cameraZoom);
    expect(H.bounds.h).toBeCloseTo(gameConfig.gameHeight / gameConfig.cameraZoom);
  });

  it('sàn, chỗ vào, chỗ thức dậy lấy đúng số đo props.json / houseLayout.json (cộng gốc khu)', () => {
    const spec = interiorSpec();
    expect(H.floor).toEqual({ x: ORIGIN.x + 112, y: ORIGIN.y + 248, w: 1040, h: 288 });
    expect(H.spawn).toEqual({ x: ORIGIN.x + spec.door.spawn[0], y: ORIGIN.y + spec.door.spawn[1] });
    expect(H.exit.x0).toBeLessThan(H.spawn.x);
    expect(H.exit.x1).toBeGreaterThan(H.spawn.x);
  });

  it('đủ 5 vật: giường, rương, bếp, hũ gạo, nón ông nội', () => {
    expect(H.objects.map((o) => o.id).sort()).toEqual([...HOUSE_TARGETS].sort());
  });

  it('giường chân đế 2×2 ô, rương / hũ gạo 1 ô, bếp 2×1 ô ở đáy ảnh; nón treo vách đi xuyên (không chân đế)', () => {
    expect(houseObject(H, 'bed').foot).toMatchObject({ w: 2 * T, h: 2 * T });
    expect(houseObject(H, 'chest').foot).toMatchObject({ w: T, h: T });
    expect(houseObject(H, 'riceJar').foot).toMatchObject({ w: T, h: T });
    const stove = houseObject(H, 'stove');
    expect(stove.foot).toMatchObject({ w: 2 * T, h: T });
    expect(stove.foot!.y + stove.foot!.h).toBe(stove.image.y + stove.image.h);
    const hat = houseObject(H, 'grandpaHat');
    expect(hat.foot).toBeNull();
    // Nón origin giữa: neo = tâm ảnh, nằm trên vách (trên mép sàn).
    expect(hat.image.x + hat.image.w / 2).toBe(hat.x);
    expect(hat.image.y + hat.image.h / 2).toBe(hat.y);
    expect(hat.image.y + hat.image.h).toBeLessThanOrEqual(H.floor.y);
  });

  it('đồ đạc không đè nhau và không chắn khe cửa / chỗ vào / chỗ thức dậy', () => {
    const feetRects = H.objects.flatMap((o) => (o.foot ? [{ id: o.id, r: o.foot }] : []));
    for (let i = 0; i < feetRects.length; i++) {
      for (let j = i + 1; j < feetRects.length; j++) expect(overlap(feetRects[i].r, feetRects[j].r), `${feetRects[i].id}/${feetRects[j].id}`).toBe(false);
    }
    expect(isFreeHouseSpot(H, H.spawn.x, H.spawn.y, FW, FH)).toBe(true);
    expect(isFreeHouseSpot(H, H.wakeSpot.x, H.wakeSpot.y, FW, FH)).toBe(true);
    // Lối từ cửa vào giữa phòng thông (cột x = spawn, từ sàn trên xuống sàn dưới).
    const lane: PxRect = { x: H.spawn.x - FW / 2, y: H.floor.y, w: FW, h: H.floor.h };
    for (const { id, r } of feetRects) expect(overlap(lane, r), id).toBe(false);
  });

  it('chỗ thức dậy ngay cạnh giường (tầm phím F tới giường)', () => {
    expect(houseTargetInReach(H, 'bed', H.wakeSpot.x, H.wakeSpot.y, gameConfig.interactKeyRange * T)).toBe(true);
  });
});

describe('vật tương tác trong nhà (T-093)', () => {
  it('click trúng ảnh vật → đúng vật; sàn trống → không gì', () => {
    for (const o of H.objects) expect(houseTargetAt(H, o.image.x + o.image.w / 2, o.image.y + o.image.h / 2)).toBe(o.id);
    expect(houseTargetAt(H, H.spawn.x, H.spawn.y)).toBeNull();
  });

  it('phím F: vật gần nhất trong tầm; giữa phòng không đứng cạnh vật nào', () => {
    const range = gameConfig.interactKeyRange * T;
    const chest = houseObject(H, 'chest').foot!;
    expect(nearestHouseTarget(H, chest.x + chest.w / 2, chest.y + chest.h + 20, range)).toBe('chest');
    const stove = houseObject(H, 'stove').foot!;
    expect(nearestHouseTarget(H, stove.x + stove.w / 2, stove.y + stove.h + 20, range)).toBe('stove');
    expect(nearestHouseTarget(H, H.spawn.x, H.spawn.y, range)).toBeNull();
  });

  it('nón treo vách: đứng sát vách dưới nón là "cạnh" (vùng với tới kéo xuống tới mép sàn)', () => {
    const hat = houseObject(H, 'grandpaHat');
    expect(hat.reach.y + hat.reach.h).toBeGreaterThanOrEqual(H.floor.y);
    expect(nearestHouseTarget(H, hat.x, H.floor.y + FH / 2, gameConfig.interactKeyRange * T)).toBe('grandpaHat');
  });

  it('distanceToRect: 0 khi ở trong, đo tới mép gần nhất khi ở ngoài', () => {
    const r = { x: 0, y: 0, w: 10, h: 10 };
    expect(distanceToRect(r, 5, 5)).toBe(0);
    expect(distanceToRect(r, 13, 5)).toBe(3);
    expect(distanceToRect(r, 13, 14)).toBe(5);
  });
});

describe('vào / ra cửa (T-093)', () => {
  const d = L.houseDoor;
  const doorBottom = (d.y + d.h) * T;
  const doorMid = (d.x + d.w / 2) * T;

  it('Vườn: chân chạm bậc thềm + bấm lên + giữa bề ngang cửa → vào', () => {
    const f = feet(doorMid, doorBottom + FH / 2);
    expect(shouldEnterHouse(d, T, f, -1, 3)).toBe(true);
  });

  it('không vào khi: không bấm lên, còn cách bậc, lệch khỏi cửa', () => {
    expect(shouldEnterHouse(d, T, feet(doorMid, doorBottom + FH / 2), 0, 3)).toBe(false);
    expect(shouldEnterHouse(d, T, feet(doorMid, doorBottom + FH / 2), 1, 3)).toBe(false);
    expect(shouldEnterHouse(d, T, feet(doorMid, doorBottom + FH / 2 + 10), -1, 3)).toBe(false);
    expect(shouldEnterHouse(d, T, feet(d.x * T - 30, doorBottom + FH / 2), -1, 3)).toBe(false);
    expect(shouldEnterHouse(d, T, feet((d.x + d.w) * T + 30, doorBottom + FH / 2), -1, 3)).toBe(false);
  });

  it('trong nhà: chân chạm mép dưới sàn + bấm xuống + trong khe cửa → ra', () => {
    const y = H.floor.y + H.floor.h - FH / 2;
    expect(shouldExitHouse(H, feet(H.spawn.x, y), 1, 3)).toBe(true);
    expect(shouldExitHouse(H, feet(H.spawn.x, y), -1, 3)).toBe(false);
    expect(shouldExitHouse(H, feet(H.spawn.x, y - 20), 1, 3)).toBe(false);
    expect(shouldExitHouse(H, feet(H.exit.x0 - 40, y), 1, 3)).toBe(false);
  });

  it('vừa vào đứng ở chỗ vào: chưa chạm cửa ra (không bị đẩy ra lại ngay)', () => {
    expect(shouldExitHouse(H, feet(H.spawn.x, H.spawn.y), 1, 3)).toBe(false);
  });

  it('ra khỏi nhà: đứng ô sân ngay dưới bậc thềm, giữa cửa, ô đó trống; chưa chạm bậc (không vào lại ngay)', () => {
    const spot = houseExitSpot(d, T);
    expect(spot).toEqual({ x: doorMid, y: doorBottom + T / 2 });
    expect(shouldEnterHouse(d, T, feet(spot.x, spot.y), -1, 3)).toBe(false);
  });

  it('isFreeHouseSpot: ngoài sàn / đè giường → không hợp lệ', () => {
    expect(isFreeHouseSpot(H, H.floor.x - 5, H.spawn.y, FW, FH)).toBe(false);
    const bed = houseObject(H, 'bed').foot!;
    expect(isFreeHouseSpot(H, bed.x + bed.w / 2, bed.y + bed.h / 2, FW, FH)).toBe(false);
  });
});

describe('T-096: tìm đường trong nhà + click cửa', () => {
  const H96 = resolveHouseLayout(houseOrigin(L.rows, gameConfig.tileSize), gameConfig.tileSize);
  const [fw, fh] = gameConfig.playerFootHitbox;
  const nav = houseNavGrid(H96, 32, fw + 4, fh + 4);
  it('ô đi được = hộp chân đứng vừa ở tâm ô (trong sàn, không đè đồ đạc)', () => {
    for (let y = 0; y < nav.rows; y++) {
      for (let x = 0; x < nav.cols; x++) {
        const c = cellCenter(nav, x, y);
        expect(isFreeCell(nav, x, y)).toBe(isFreeHouseSpot(H96, c.x, c.y, fw + 4, fh + 4));
      }
    }
    // Chỗ vào nhà và chỗ thức dậy nằm trong vùng đi được.
    const sp = cellAt(nav, H96.spawn.x, H96.spawn.y);
    expect(nearestFreeCell(nav, sp, 1)).not.toBeNull();
  });
  it('từ cửa đi tới cạnh bếp (góc phải) và giường (góc trái) được', () => {
    const finder = new PathFinder();
    const start = nearestFreeCell(nav, cellAt(nav, H96.spawn.x, H96.spawn.y), 2)!;
    for (const id of ['stove', 'bed', 'chest'] as const) {
      const r = finder.search(
        nav,
        start,
        (x, y) => {
          const c = cellCenter(nav, x, y);
          return houseTargetInReach(H96, id, c.x, c.y, 2 * 64);
        },
        () => 0,
        6000,
      );
      expect(r, id).not.toBeNull();
    }
  });
  it('khung cửa click được; chỗ đứng ra cửa nằm giữa khe cửa, hộp chân vừa sàn', () => {
    const d = H96.doorRect;
    expect(isHouseDoorAt(H96, d.x + d.w / 2, d.y + d.h / 2)).toBe(true);
    expect(isHouseDoorAt(H96, H96.floor.x + 10, H96.floor.y + 10)).toBe(false);
    const spot = houseExitStandSpot(H96, fh, 2);
    expect(spot.x).toBeGreaterThanOrEqual(H96.exit.x0);
    expect(spot.x).toBeLessThanOrEqual(H96.exit.x1);
    expect(isFreeHouseSpot(H96, spot.x, spot.y, fw + 4, fh + 4)).toBe(true);
    // Đứng đó mà bấm S là ra (khớp luật cũ).
    const feet: Box = { left: spot.x - fw / 2, right: spot.x + fw / 2, top: spot.y - fh / 2, bottom: spot.y + fh / 2 };
    expect(shouldExitHouse(H96, feet, 1, gameConfig.doorTouchPx)).toBe(true);
  });
  it('Vườn: ô bậc thềm + hàng ngay trên là khung cửa; ô sân dưới bậc thì không', () => {
    const d = L.houseDoor;
    expect(isHouseDoorTile(L, d.x, d.y)).toBe(true);
    expect(isHouseDoorTile(L, d.x + d.w - 1, d.y - 1)).toBe(true);
    expect(isHouseDoorTile(L, d.x, d.y + 1)).toBe(false);
    expect(isHouseDoorTile(L, d.x - 1, d.y)).toBe(false);
  });
});
