import { useState } from 'react';
import { Avatar, Combobox, type ComboboxItem } from '@envsemble/envui';

const people: ComboboxItem[] = [
  'Alex Morgan',
  'Sam Lee',
  'Priya Shah',
  'Jordan Ellis',
  'Taylor Kim',
  'Riley Chen',
].map((name) => {
  const handle = name.toLowerCase().replace(' ', '.');
  return {
    value: handle,
    label: name,
    description: `${handle}@example.com`,
    start: <Avatar name={name} />,
  };
});

export default function ChooseOwner() {
  const [owner, setOwner] = useState<string | null>('alex.morgan');
  return (
    <div style={{ inlineSize: 'min(100%, 24rem)' }}>
      <Combobox
        label="Owner"
        description="The person who answers questions about the plan."
        items={people}
        value={owner}
        onValueChange={setOwner}
        clearable
      />
    </div>
  );
}
