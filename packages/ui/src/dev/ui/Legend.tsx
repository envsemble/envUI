// The 3D view's legend, floating in its bottom corner with no pane: what the planes' colors mean,
// by kind of node or by window class.

import type { ReactNode } from 'react';
import { Row } from '../../layout/Layout.js';
import { Text } from '../../foundations/Text.js';
import { roundToHundredth } from '../../internal/lengths.js';
import { windowClasses } from '../units.js';

/** One entry of a legend: a swatch drawn as a plane is, and its name. */
function Swatch({
  plane,
  title,
  children,
}: {
  plane: Record<`data-${string}`, string>;
  title?: string;
  children: ReactNode;
}) {
  return (
    <Row gap={1} align="center" render={<span title={title} />}>
      <i className="env-dev-plane env-dev-swatch" {...plane} />
      {children}
    </Row>
  );
}

const kinds = ['box', 'row', 'column', 'grid', 'scaffold', 'page', 'overlay'];

export function Legend({ colorBy, rootPx }: { colorBy: 'kind' | 'window'; rootPx: number }) {
  return (
    <Row gap={2} wrap className="env-dev-legend" role="group" aria-label="Legend">
      {colorBy === 'kind' ? (
        kinds.map((kind) => (
          <Swatch
            key={kind}
            plane={{ 'data-kind': kind, ...(kind === 'overlay' && { 'data-overlay': '' }) }}
          >
            {kind}
          </Swatch>
        ))
      ) : (
        <>
          {windowClasses.map((windowClass, index) => {
            const next = windowClasses[index + 1];
            const range = next
              ? `${windowClass.from ? `${windowClass.from}–` : '< '}${next.from}`
              : `≥ ${windowClass.from}`;
            return (
              <Swatch
                key={windowClass.name}
                plane={{ 'data-window': windowClass.name, 'data-container': '' }}
                title={`${range}rem, ${roundToHundredth((next?.from ?? windowClass.from) * rootPx)}px`}
              >
                {windowClass.name}{' '}
                <Text variant="caption" emphasis="subtle" render={<span />}>
                  {range}
                </Text>
              </Swatch>
            );
          })}
          <Swatch plane={{ 'data-window': 'none', 'data-container': '' }}>container</Swatch>
          <Swatch plane={{ 'data-window': 'none' }}>not a container</Swatch>
        </>
      )}
    </Row>
  );
}
