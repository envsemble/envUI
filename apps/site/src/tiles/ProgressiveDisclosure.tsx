import { Button, Checkbox, Column, Disclosure, Select } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../previews/Motion';

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
    <Column gap={4} align="start" style={{ inlineSize: '13rem', minBlockSize: '11rem' }}>
      <Select label="Format" items={formats} defaultValue="csv" />
      <Disclosure title="Advanced options">
        <Checkbox label="Include archived" />
      </Disclosure>
      <Button>Export</Button>
    </Column>
  );
}
