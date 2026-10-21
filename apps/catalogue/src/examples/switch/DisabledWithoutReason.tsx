import { Column, Switch } from '@envsemble/envui';

export default function DisabledWithoutReason() {
  return (
    <Column gap={3} align="start">
      <Switch label="Two-step sign-in" defaultChecked disabled />
      <Switch label="Share documents outside Northwind" disabled />
    </Column>
  );
}
