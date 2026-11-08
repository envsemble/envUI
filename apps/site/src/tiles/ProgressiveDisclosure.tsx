import { Button, Checkbox, Column, Disclosure, Row, Select, Text } from '@envsemble/envui';
import type { PointerStep } from '../motion/PointerPlan';
import { usePointer } from '../motion/PointerPlayback';

const formats = [
  { value: 'csv', label: 'CSV' },
  { value: 'pdf', label: 'PDF' },
];

/** The advanced options opened, a moment to see them, and closed again. */
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

/** An export: what most people need first, the rest behind Advanced options. */
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
