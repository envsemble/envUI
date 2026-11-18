import { useState } from 'react';
import { ResizeHandle, Row, Surface, Text } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

const row = '[data-env-layout="row"]';
const rowWidthRem = 20;
const at = (widthRem: number) => (widthRem + 0.375) / rowWidthRem;

const script: PointerStep[] = [
  { wait: 240 },
  { to: row, x: at(7) },
  { wait: 300 },
  { press: true },
  { to: row, x: at(10), duration: 900 },
  { wait: 300 },
  { to: row, x: at(7), duration: 900 },
  { release: true },
  { wait: 300 },
  { leave: true },
  { wait: 300 },
];

export default function ResizeHandleTile() {
  const [width, setWidth] = useState(7);
  usePointer(script);
  return (
    <Row align="stretch" style={{ inlineSize: `${rowWidthRem}rem`, blockSize: '7rem' }}>
      <Surface radius="none" padding={2} style={{ inlineSize: `${width}rem`, flex: 'none' }}>
        <Text variant="body-sm">Files</Text>
      </Surface>
      <ResizeHandle
        axis="inline"
        label="Resize the files"
        value={width}
        min={5}
        max={12}
        unit="rem"
        step={1}
        onChange={setWidth}
      />
      <Surface radius="none" padding={2} background="page" style={{ flex: 1 }}>
        <Text variant="body-sm">Preview</Text>
      </Surface>
    </Row>
  );
}
