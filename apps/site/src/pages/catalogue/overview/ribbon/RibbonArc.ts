import type { RibbonFrame } from './RibbonScene';

const arcUnitShare = 0.7;
const arcInsetUnits = 0.12;
const arcDropUnits = 0.25;
const arcRoll = -0.2;
const textClearancePx = 8;

const arcTopHeightByX: [number, number][] = [
  [-1.264, 0.183],
  [-1.081, 0.282],
  [-0.897, 0.359],
  [-0.714, 0.414],
  [-0.531, 0.447],
  [-0.348, 0.465],
];

function arcTopHeight(x: number) {
  const table = arcTopHeightByX;
  if (x <= table[0]![0]) return table[0]![1];
  for (let i = 1; i < table.length; i++) {
    const [x1, h1] = table[i]!;
    const [x0, h0] = table[i - 1]!;
    if (x <= x1) return h0 + ((h1 - h0) * (x - x0)) / (x1 - x0);
  }
  return table[table.length - 1]![1];
}

export function arcFrame(outer: DOMRect, widget: DOMRect, facts: DOMRect | undefined): RibbonFrame {
  const unit = arcUnitShare * outer.width;
  const cornerX = widget.right - outer.left - arcInsetUnits * unit;
  let cornerY = widget.top - outer.top - arcDropUnits * unit;
  if (facts) {
    const reach = (facts.right - outer.left + textClearancePx - cornerX) / unit;
    const clear = facts.bottom - outer.top + textClearancePx + arcTopHeight(reach) * unit;
    cornerY = Math.max(cornerY, clear);
  }
  return {
    width: outer.width,
    height: outer.height,
    cornerX,
    cornerY,
    unit,
    placed: true,
    roll: arcRoll,
  };
}
