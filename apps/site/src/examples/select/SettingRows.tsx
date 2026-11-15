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
    <List.Root title="Notifications">
      <List.Item
        label="E-mail digest"
        description="A summary of what changed in your projects."
        control={<Select items={digestOptions} defaultValue="weekly" />}
      />
      <List.Item
        label="Due date reminders"
        description="For tasks assigned to you."
        control={<Select items={reminderOptions} defaultValue="1d" />}
      />
    </List.Root>
  );
}
