import { Checkbox, Column, Text } from '@envsemble/envui';

export default function DisabledWithReason() {
  return (
    <Column gap={2}>
      <Checkbox label="Share with guests" disabled aria-describedby="share-reason" />
      <Text id="share-reason" variant="caption" emphasis="muted">
        Your workspace admin has turned off guest access.
      </Text>
    </Column>
  );
}
