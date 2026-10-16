import { useId } from 'react';
import { Radio, RadioGroup, Stack, Text } from '@envsemble/envui';

export default function InheritedAccess() {
  const reason = useId();
  return (
    <Stack gap={3} align="start">
      <RadioGroup
        label="Access"
        name="inherited-access"
        value="team"
        disabled
        aria-describedby={reason}
      >
        <Radio value="team" label="Team" />
        <Radio value="private" label="Private" />
      </RadioGroup>
      <Text id={reason} variant="supporting">
        This folder takes its access from Northwind launch. Change it there.
      </Text>
    </Stack>
  );
}
