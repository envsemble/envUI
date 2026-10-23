import { Avatar, Column, Combobox, type ComboboxItem } from '@envsemble/envui';

const people: ComboboxItem[] = ['Alex Morgan', 'Sam Lee', 'Priya Shah', 'Jordan Ellis'].map(
  (name) => {
    const handle = name.toLowerCase().replace(' ', '.');
    return { value: handle, label: name, start: <Avatar name={name} /> };
  },
);

export default function Variants() {
  return (
    // As wide as a form column.
    <Column gap={5} style={{ inlineSize: 'min(100%, 22rem)' }}>
      <Combobox label="Owner" items={people} defaultValue="alex.morgan" />
      <Combobox variant="floating" label="Approver" items={people} defaultValue="sam.lee" />
    </Column>
  );
}
