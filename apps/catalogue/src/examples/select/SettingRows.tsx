import { List, Select } from '@envsemble/envui';

const digestOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'never', label: 'Never' },
];
const reminderOptions = [
  { value: '1h', label: '1 hour before' },
  { value: '1d', label: '1 day before' },
  { value: 'none', label: 'No reminder' },
];

export default function SettingRows() {
  return (
    <List.Root aria-label="Notifications">
      <List.Item
        title="E-mail digest"
        detail="A summary of what changed in your projects."
        action={
          // The row's title shows the name, so the select takes it as its aria-label.
          <Select
            variant="outline"
            aria-label="E-mail digest"
            items={digestOptions}
            defaultValue="weekly"
          />
        }
      />
      <List.Item
        title="Due date reminders"
        detail="For tasks assigned to you."
        action={
          <Select
            variant="outline"
            aria-label="Due date reminders"
            items={reminderOptions}
            defaultValue="1d"
          />
        }
      />
    </List.Root>
  );
}
