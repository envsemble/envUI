import { Column, List, Surface, Switch, Text } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';
import { outlined } from './Outline';

const toggle = (index: number) =>
  `.env-list-item:nth-child(${index} of .env-list-item) .env-switch-input`;

/** A preference turned on, which applies at once, and off again. */
const script: PointerStep[] = [
  { wait: 400 },
  { to: toggle(2) },
  { wait: 400 },
  { click: true },
  { wait: 1400 },
  { to: toggle(1), duration: 400 },
  { wait: 200 },
  { click: true },
  { wait: 1000 },
  { click: true },
  { wait: 300 },
  { to: toggle(2), duration: 350 },
  { click: true },
  { wait: 500 },
  { leave: true },
  { wait: 400 },
];

/** A section of settings: preferences that apply as they change. */
export default function SettingsTile() {
  usePointer(script);
  return (
    <Column gap={3} style={{ inlineSize: '17rem' }}>
      <Text render={<span />} variant="title">
        Notifications
      </Text>
      <Surface background="muted" padding={1} radius="sm" style={outlined}>
        <List.Root aria-label="Notifications">
          <List.Item label="Email" end={<Switch aria-label="Email" defaultChecked />} />
          <List.Item label="Weekly digest" end={<Switch aria-label="Weekly digest" />} />
        </List.Root>
      </Surface>
    </Column>
  );
}
