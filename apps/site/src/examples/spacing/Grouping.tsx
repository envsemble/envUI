import { Column, Switch, Text, TextField } from '@envsemble/envui';

export default function Grouping() {
  return (
    <Column gap={8}>
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
    </Column>
  );
}
