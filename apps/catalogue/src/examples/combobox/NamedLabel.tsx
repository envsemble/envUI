import { Avatar, Combobox, type ComboboxItem } from '@envsemble/envui';

const people: ComboboxItem[] = ['Alex Morgan', 'Sam Lee', 'Priya Shah', 'Jordan Ellis'].map(
  (name) => {
    const handle = name.toLowerCase().replace(' ', '.');
    return { value: handle, label: name, start: <Avatar name={name} /> };
  },
);

export default function NamedLabel() {
  return (
    <Combobox
      multiple
      label="Reviewers"
      placeholder="Add people"
      items={people}
      defaultValue={['sam.lee']}
      style={{ inlineSize: 'min(100%, 18rem)' }}
    />
  );
}
