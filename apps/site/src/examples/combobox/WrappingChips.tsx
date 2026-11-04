import { Avatar, Combobox, type ComboboxItem } from '@envsemble/envui';

const people: ComboboxItem[] = ['Alex Morgan', 'Sam Lee', 'Priya Shah', 'Jordan Ellis'].map(
  (name) => {
    const handle = name.toLowerCase().replace(' ', '.');
    return { value: handle, label: name, start: <Avatar name={name} /> };
  },
);

export default function WrappingChips() {
  return (
    <Combobox
      multiple
      label="Reviewers"
      placeholder="Add people"
      items={people}
      defaultValue={['alex.morgan', 'sam.lee', 'priya.shah']}
    />
  );
}
