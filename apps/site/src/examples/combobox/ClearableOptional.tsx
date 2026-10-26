import { Avatar, Combobox, type ComboboxItem } from '@envsemble/envui';

const people: ComboboxItem[] = ['Alex Morgan', 'Sam Lee', 'Priya Shah', 'Jordan Ellis'].map(
  (name) => {
    const handle = name.toLowerCase().replace(' ', '.');
    return { value: handle, label: name, start: <Avatar name={name} /> };
  },
);

export default function ClearableOptional() {
  return (
    <Combobox
      label="Backup owner"
      description="Optional."
      items={people}
      defaultValue="priya.shah"
      clearable
      style={{ inlineSize: 'min(100%, 18rem)' }}
    />
  );
}
