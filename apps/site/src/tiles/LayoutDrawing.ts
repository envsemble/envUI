import { createElement, type CSSProperties, type ReactNode } from 'react';

const hairline: CSSProperties = {
  fill: 'none',
  stroke: 'var(--env-color-border-default)',
  strokeWidth: 1,
  vectorEffect: 'non-scaling-stroke',
};

const sheet: CSSProperties = {
  position: 'absolute',
  inset: 0,
  inlineSize: '100%',
  blockSize: '100%',
  overflow: 'visible',
  pointerEvents: 'none',
};

type Point = readonly [x: string, y: string];

function drawing(
  lines: readonly (readonly [Point, Point])[] | 'edges',
  radius?: string,
): ReactNode {
  const shapes =
    lines === 'edges'
      ? [
          createElement('rect', {
            key: 0,
            width: '100%',
            height: '100%',
            style: radius ? { ...hairline, rx: radius, ry: radius } : hairline,
          }),
        ]
      : lines.map(([[x1, y1], [x2, y2]], index) =>
          createElement('line', { key: index, x1, y1, x2, y2, style: hairline }),
        );
  return createElement('svg', { 'aria-hidden': true, focusable: 'false', style: sheet }, shapes);
}

export const edges = (radius?: string) => drawing('edges', radius);

export function Item({
  width,
  height,
  radius,
}: {
  width: string;
  height: string;
  radius?: string;
}) {
  return createElement(
    'span',
    { style: { position: 'relative', flex: 'none', inlineSize: width, blockSize: height } },
    edges(radius),
  );
}

export function Mark({
  at,
  lines,
}: {
  at: CSSProperties;
  lines: readonly (readonly [Point, Point])[];
}) {
  return createElement('span', { style: { position: 'absolute', ...at } }, drawing(lines));
}

export const gap = (
  along: 'inline' | 'block',
  { from, across, off }: { from: string; across: string; off: string },
): { at: CSSProperties; lines: readonly (readonly [Point, Point])[] } =>
  along === 'inline'
    ? {
        at: { left: from, width: across, top: off, height: 'var(--env-space-1)' },
        lines: [
          [
            ['0', '100%'],
            ['0', '0'],
          ],
          [
            ['0', '0'],
            ['100%', '0'],
          ],
          [
            ['100%', '0'],
            ['100%', '100%'],
          ],
        ],
      }
    : {
        at: { top: from, height: across, left: off, width: 'var(--env-space-1)' },
        lines: [
          [
            ['100%', '0'],
            ['0', '0'],
          ],
          [
            ['0', '0'],
            ['0', '100%'],
          ],
          [
            ['0', '100%'],
            ['100%', '100%'],
          ],
        ],
      };
