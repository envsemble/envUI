import { Button, Column, Tabs, Text } from '@envsemble/envui';
import { Example } from '../../figures/Example';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

const views = [
  {
    value: 'summary',
    label: 'Summary',
    text: 'A shared space for the launch plan and its budget.',
  },
  { value: 'files', label: 'Files', text: 'Launch plan.pdf, Budget 2026.xlsx and 4 more.' },
  { value: 'activity', label: 'Activity', text: 'Priya Shah updated the launch plan today.' },
  { value: 'reports', label: 'Reports', text: 'Reports open once the launch has a week of data.' },
];

/*
 * The keyboard's focus enters the rail on the chosen tab; the right arrow key moves it tab by
 * tab, each showing its panel at once, and on to the disabled Reports, which it reaches but
 * doesn't choose; the left arrow key goes back to Summary, and focus moves on.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { focus: '.env-tabs-tab[aria-selected="true"]' },
  { wait: 900 },
  { key: 'ArrowRight' },
  { wait: 900 },
  { key: 'ArrowRight' },
  { wait: 900 },
  { key: 'ArrowRight' },
  { wait: 1200 },
  { key: 'ArrowLeft' },
  { wait: 500 },
  { key: 'ArrowLeft' },
  { wait: 500 },
  { key: 'ArrowLeft' },
  { wait: 900 },
  { blur: true },
  { wait: 800 },
];

function Choosing() {
  usePointer(script);
  return (
    <Tabs
      aria-label="Project views"
      style={{ inlineSize: 'min(100%, 26rem)' }}
      items={views.map(({ value, label, text }) => ({
        value,
        button: <Button>{label}</Button>,
        disabled: value === 'reports',
        content: (
          <Column gap={2}>
            <Text>{text}</Text>
          </Column>
        ),
      }))}
    />
  );
}

/** Tabs chosen with the arrow keys: each panel at once, and a disabled tab reached, not chosen. */
export default function ChoosingATab() {
  return (
    <Example size="content">
      <MotionStage label="the arrow keys choosing tabs">
        <Choosing />
      </MotionStage>
    </Example>
  );
}
