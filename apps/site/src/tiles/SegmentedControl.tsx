import { useState } from 'react';
import { SegmentedControl } from '@envsemble/envui';
import { IconViewList } from '@envsemble/envui/icons/ViewList';
import { IconViewModule } from '@envsemble/envui/icons/ViewModule';
import { usePointer, type PointerStep } from '../motion/Motion';

const segment = (index: number) =>
  `.env-segmented-control-item:nth-child(${index} of .env-segmented-control-item)`;

/** Board chosen, its selection sliding across, and List again. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: segment(2) },
  { wait: 400 },
  { click: true },
  { wait: 1200 },
  { to: segment(1), duration: 400 },
  { wait: 200 },
  { click: true },
  { wait: 700 },
  { leave: true },
  { wait: 400 },
];

/** A segmented control of two views, List chosen. */
export default function SegmentedControlTile() {
  const [value, setValue] = useState('list');
  usePointer(script);
  return (
    <SegmentedControl
      aria-label="Layout"
      value={value}
      onValueChange={setValue}
      items={[
        { value: 'list', label: 'List', icon: <IconViewList /> },
        { value: 'board', label: 'Board', icon: <IconViewModule /> },
      ]}
    />
  );
}
