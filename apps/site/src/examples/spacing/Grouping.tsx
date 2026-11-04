import { Column, Surface, Switch, Text, TextField } from '@envsemble/envui';

// Say what belongs together: a tight gap inside a group, a roomier one between groups, and the
// widest between sections.
export default function Grouping() {
  return (
    <Surface background="default" padding={6} radius="xl" render={<Column gap={8} />}>
      <Column gap={4}>
        <Column gap={1}>
          <Text render={<h3 />} variant="title">
            Profile
          </Text>
          <Text emphasis="muted">How other people see you.</Text>
        </Column>
        <TextField label="Name" defaultValue="Priya Shah" />
        <TextField label="Email" defaultValue="priya.shah@example.com" />
      </Column>
      <Column gap={4}>
        <Column gap={1}>
          <Text render={<h3 />} variant="title">
            Notifications
          </Text>
          <Text emphasis="muted">What we send you by email.</Text>
        </Column>
        <Switch label="A weekly summary" defaultChecked />
        <Switch label="When someone mentions you" />
      </Column>
    </Surface>
  );
}
