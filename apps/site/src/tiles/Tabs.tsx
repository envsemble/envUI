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

/** Three tabs of a project, Summary chosen, over its one-line panel. */
export default function TabsTile() {
  usePointer(script);
  return (
    <Tabs
      aria-label="Project views"
      items={[
        {
          value: 'summary',
          label: 'Summary',
          content: <Text>Plans and owners.</Text>,
        },
        { value: 'files', label: 'Files', content: <Text>Twelve files.</Text> },
        {
          value: 'activity',
          label: 'Activity',
          content: <Text>Updated today.</Text>,
        },
      ]}
    />
  );
}
