import { useState } from 'react';
import { SegmentedControl } from '@envsemble/envui';
import { IconViewList } from '@envsemble/envui/icons/ViewList';
import { IconViewModule } from '@envsemble/envui/icons/ViewModule';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

const segment = (index: number) =>
  `.env-segmented-control-item:nth-child(${index} of .env-segmented-control-item)`;

/** Chooses Board, the selection sliding across, then List again. */
const script: PointerStep[] = [
  { wait: 180 },
  { to: segment(2) },
  { wait: 240 },
  { click: true },
  { wait: 720 },
  { to: segment(1), duration: 400 },
  { wait: 120 },
  { click: true },
  { wait: 420 },
  { leave: true },
  { wait: 240 },
];

/** A segmented control of two views, with List chosen. */
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
