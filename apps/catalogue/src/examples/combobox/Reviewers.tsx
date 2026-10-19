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

export default function Reviewers() {
  const [reviewers, setReviewers] = useState<string[]>(['sam.lee', 'priya.shah']);
  return (
    <div style={{ inlineSize: 'min(100%, 24rem)' }}>
      <Combobox
        multiple
        label="Reviewers"
        placeholder="Add people"
        items={people}
        value={reviewers}
        onValueChange={setReviewers}
      />
    </div>
  );
}
