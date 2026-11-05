import { useState } from 'react';
import { Tabs, Text } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

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
  { value: 'summary', label: 'Summary', short: 'Plan', text: 'Plans and owners.' },
  { value: 'files', label: 'Files', short: 'Files', text: 'Twelve files.' },
  { value: 'activity', label: 'Activity', short: 'Log', text: 'Updated today.' },
];

/**
 * Three tabs of a project, Summary chosen, over its one-line panel.
 * In a phone's narrower tile the tabs take shorter names, so the strip is drawn at about its own
 * size there.
 */
export default function TabsTile() {
  const narrow = useMedia(narrowGallery);
  const [value, setValue] = useState('summary');
  usePointer(script);
  return (
    <Tabs
      aria-label="Project views"
      value={value}
      onValueChange={(next) => next && setValue(next)}
      items={panels.map((panel) => ({
        value: panel.value,
        label: narrow ? panel.short : panel.label,
        content: <Text>{panel.text}</Text>,
      }))}
    />
  );
}
