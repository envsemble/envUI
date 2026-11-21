import { useState } from 'react';
import { Column, ResizeHandle, Surface, Text } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

const column = '[data-env-layout="column"]';
const handle = '.env-resize-handle';
const columnHeightRem = 7;
const logsAt = (heightRem: number) => (columnHeightRem - heightRem) / columnHeightRem;

const logLines = [
  'Installing dependencies',
  'Building the site',
  'Running 214 tests',
  '214 passed',
];

const script: PointerStep[] = [
  { wait: 240 },
  { to: handle, x: 0.5, y: 0.5 },
  { wait: 300 },
  { press: true },
  { to: column, x: 0.5, y: logsAt(4.75), duration: 900 },
  { wait: 300 },
  { to: column, x: 0.5, y: logsAt(2.5), duration: 900 },
  { release: true },
  { wait: 300 },
  { leave: true },
  { wait: 300 },
];

export default function ResizeHandleTile() {
  const [height, setHeight] = useState(2.5);
  usePointer(script);
  return (
    <Column style={{ inlineSize: '20rem', blockSize: `${columnHeightRem}rem` }}>
      <Surface radius="none" padding={2} background="page" style={{ flex: 1, minBlockSize: 0 }}>
        <Text variant="body-sm">Deploy to staging</Text>
      </Surface>
      <ResizeHandle
        axis="block"
        reverse
        label="Resize the logs"
        value={height}
        min={2}
        max={5}
        unit="rem"
        step={0.5}
        onChange={setHeight}
      />
      <Surface
        radius="none"
        padding={2}
        render={<Column gap={1} />}
        style={{ blockSize: `${height}rem`, flex: 'none', overflow: 'hidden' }}
      >
        {logLines.map((line) => (
          <Text key={line} variant="caption" emphasis="muted">
            {line}
          </Text>
        ))}
      </Surface>
    </Column>
  );
}
