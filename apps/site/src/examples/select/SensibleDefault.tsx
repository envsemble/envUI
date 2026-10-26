import { Select } from '@envsemble/envui';

const frequencies = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'never', label: 'Never' },
];

export default function SensibleDefault() {
  return <Select label="E-mail digest" items={frequencies} defaultValue="weekly" />;
}
