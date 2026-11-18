import { Column, Select, Text } from '@envsemble/envui';

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

export default function SettingsForm() {
  return (
    <Column gap={4} render={<form />} style={{ inlineSize: 'min(100%, 24rem)' }}>
      <Text variant="title" render={<h3 />}>
        Notifications
      </Text>
      <Select
        label="E-mail digest"
        description="A summary of what changed in your projects."
        items={digestOptions}
        defaultValue="weekly"
      />
      <Select
        label="Due date reminders"
        description="For tasks assigned to you."
        items={reminderOptions}
        defaultValue="1d"
      />
    </Column>
  );
}
