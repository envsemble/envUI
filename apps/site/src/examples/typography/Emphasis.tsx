import { Column, Text } from '@envsemble/envui';

export default function Emphasis() {
  return (
    <Column gap={2}>
      <Text>Quarterly report</Text>
      <Text emphasis="muted">Updated today by Priya Shah</Text>
    </Column>
  );
}
