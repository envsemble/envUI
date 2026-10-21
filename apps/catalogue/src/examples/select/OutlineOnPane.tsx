import { Select, Surface } from '@envsemble/envui';

const frequencies = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'never', label: 'Never' },
];

export default function OutlineOnPane() {
  return (
    <Surface padding={5}>
      <Select variant="outline" label="E-mail digest" items={frequencies} defaultValue="weekly" />
    </Surface>
  );
}
