import { Avatar, Combobox, type ComboboxItem } from '@envsemble/envui';

const people: ComboboxItem[] = ['Alex Morgan', 'Sam Lee', 'Priya Shah', 'Jordan Ellis'].map(
  (name) => {
    const handle = name.toLowerCase().replace(' ', '.');
    return { value: handle, label: name, start: <Avatar name={name} /> };
  },
);

export default function ComboboxListAnatomy() {
  return (
    <Combobox
      label="Owner"
      placeholder="Choose an owner"
      items={people}
      defaultValue="sam.lee"
      defaultOpen
      style={{ inlineSize: 'min(100%, 20rem)' }}
    />
  );
}
