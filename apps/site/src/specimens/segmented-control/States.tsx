import { useState } from 'react';
import { SegmentedControl } from '@envsemble/envui';
import { IconViewList } from '@envsemble/envui/icons/ViewList';
import { IconViewModule } from '@envsemble/envui/icons/ViewModule';
import { SpecimenFrame, SpecimenGrid, SpecimenPart } from '../../figures/SpecimenFrame';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { PressedKeys } from '../../motion/PressedKeys';

const statuses = [
  { value: 'open', label: 'Open', count: 12 },
  { value: 'blocked', label: 'Blocked', count: 3 },
  { value: 'done', label: 'Done', count: 40 },
];
const ignore = () => undefined;

const segment = (label: string, index: number) =>
  `[aria-label="${label}"] .env-segmented-control-item:nth-child(${index} of .env-segmented-control-item)`;

const script: PointerStep[] = [
  { wait: 300 },
  { to: segment('Layout', 1), x: 0.55, y: 0.6 },
  { wait: 270 },
  { click: true },
  { wait: 660 },
  { to: segment('Layout', 2), x: 0.5, y: 0.6, duration: 450 },
  { wait: 210 },
  { click: true },
  { wait: 420 },
  { leave: true },
  { wait: 300 },
  { cue: 'Tab' },
  { focus: segment('Period', 1) },
  { wait: 540 },
  { cue: '→' },
  { key: 'ArrowRight' },
  { wait: 600 },
  { cue: '→' },
  { key: 'ArrowRight' },
  { wait: 600 },
  { cue: 'none' },
  { blur: true },
  { wait: 540 },
];

function Choosing() {
  const [layout, setLayout] = useState('board');
  const [period, setPeriod] = useState('day');
  const [pressed, setPressed] = useState<{ keys: string[]; press: number } | null>(null);
  usePointer(script, {
    onCue: (cue) =>
      setPressed((last) =>
        cue === 'none' ? null : { keys: [cue], press: (last?.press ?? 0) + 1 },
      ),
  });
  return (
    <SpecimenGrid>
      <PressedKeys keys={pressed?.keys ?? null} press={pressed?.press ?? 0} />
      <SpecimenPart title="With counts">
        <SegmentedControl
          aria-label="Work items"
          value="open"
          onValueChange={ignore}
          items={statuses}
        />
      </SpecimenPart>
      <SpecimenPart title="With icons">
        <SegmentedControl
          aria-label="Layout"
          value={layout}
          onValueChange={setLayout}
          items={[
            { value: 'list', label: 'List', start: <IconViewList /> },
            { value: 'board', label: 'Board', start: <IconViewModule /> },
          ]}
        />
      </SpecimenPart>
      <SpecimenPart title="A disabled option">
        <SegmentedControl
          aria-label="Period"
          value={period}
          onValueChange={setPeriod}
          items={[
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
            { value: 'quarter', label: 'Quarter', disabled: true },
          ]}
        />
      </SpecimenPart>
      <SpecimenPart title="Disabled">
        <SegmentedControl
          aria-label="Work items, unavailable"
          value="blocked"
          onValueChange={ignore}
          items={statuses}
          disabled
        />
      </SpecimenPart>
    </SpecimenGrid>
  );
}

export default function States() {
  return (
    <SpecimenFrame size="collection">
      <MotionStage label="choosing an option, and the arrow keys skipping a disabled one">
        <Choosing />
      </MotionStage>
    </SpecimenFrame>
  );
}
