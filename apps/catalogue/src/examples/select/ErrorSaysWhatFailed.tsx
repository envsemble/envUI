import { Select } from '@envsemble/envui';

const owners = [
  { value: 'alex', label: 'Alex Morgan' },
  { value: 'sam', label: 'Sam Lee' },
];

export default function ErrorSaysWhatFailed() {
  return (
    <Select
      label="Owner"
      placeholder="Choose an owner"
      required
      error="Required field."
      items={owners}
    />
  );
}
