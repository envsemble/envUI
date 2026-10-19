import { useId } from 'react';
import { Stack, Switch, Text } from '@envsemble/envui';

export default function ManagedSetting() {
  const reason = useId();
  return (
    <Stack gap={3} align="start">
      <Switch label="Two-step sign-in" defaultChecked disabled aria-describedby={reason} />
      <Switch label="Share documents outside Northwind" disabled aria-describedby={reason} />
      <Text id={reason} variant="body-sm">
        Your administrator, Sam Lee, manages these settings for everyone at Northwind.
      </Text>
    </Stack>
  );
}
