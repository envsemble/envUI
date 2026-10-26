import { Select } from '@envsemble/envui';

const frequencies = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'never', label: 'Never' },
];

export default function NeedlessPlaceholder() {
  return <Select label="E-mail digest" items={frequencies} placeholder="Choose a frequency" />;
}
