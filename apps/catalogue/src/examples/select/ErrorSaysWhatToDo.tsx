import { Select } from '@envsemble/envui';

const owners = [
  { value: 'alex', label: 'Alex Morgan' },
  { value: 'sam', label: 'Sam Lee' },
];

export default function ErrorSaysWhatToDo() {
  return (
    <Select
      label="Owner"
      placeholder="Choose an owner"
      required
      error="Choose an owner to continue."
      items={owners}
    />
  );
}
