import { Button, Checkbox, Column, Disclosure, Row, Select, Text } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import type { TileWindow } from './Tiles';

const formats = [
  { value: 'csv', label: 'CSV' },
  { value: 'pdf', label: 'PDF' },
];

/** Opens the advanced options, waits a moment to show them, and closes them again. */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-disclosure summary', x: 0.25 },
  { wait: 400 },
  { click: true },
  { wait: 1800 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 400 },
];

/** A larger window than the tiles' (TileStage.css), drawn smaller: the component doesn't fit theirs. */
export const tileWindow: TileWindow = { width: 16, height: 12 };

/** An export: what most people need first, with the rest behind Advanced options. */
export default function ProgressiveDisclosureTile() {
  usePointer(script);
  return (
    <Column gap={3} style={{ inlineSize: '17rem' }}>
      <Text render={<span />} variant="title">
        Export projects
      </Text>
      <Select label="Format" items={formats} defaultValue="csv" />
      <Disclosure title="Advanced options">
        <Checkbox label="Include archived" />
      </Disclosure>
      <Row justify="end">
        <Button>Export</Button>
      </Row>
    </Column>
  );
}
