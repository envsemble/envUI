import { useState } from 'react';
import { Tabs, Text } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

const tab = (index: number) => `.env-tabs-tab:nth-child(${index} of .env-tabs-tab)`;

/** Files chosen, then Activity, the indicator and the panel following, and Summary again. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: tab(2) },
  { wait: 400 },
  { click: true },
  { wait: 1000 },
  { to: tab(3), duration: 350 },
  { wait: 200 },
  { click: true },
  { wait: 1000 },
  { to: tab(1), duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 400 },
];

const panels = [
  { value: 'summary', label: 'Summary', text: 'Plans and owners.' },
  { value: 'files', label: 'Files', text: 'Twelve files.' },
  { value: 'activity', label: 'Activity', text: 'Updated today.' },
];

/**
 * Three tabs of a project, Summary chosen, over its one-line panel. A panel's line goes at once as
 * another tab is chosen, while the next one fades in, so two lines never show over each other.
 */
export default function TabsTile() {
  const [value, setValue] = useState('summary');
  usePointer(script);
  return (
    <Tabs
      aria-label="Project views"
      value={value}
      onValueChange={(next) => next && setValue(next)}
      items={panels.map((panel) => ({
        value: panel.value,
        label: panel.label,
        content: <Text style={{ opacity: panel.value === value ? 1 : 0 }}>{panel.text}</Text>,
      }))}
    />
  );
}
