import { Column, Meter } from '@envsemble/envui';

export default function InlineUsage() {
  return (
    <Column gap={3} style={{ inlineSize: 'min(100%, 24rem)' }}>
      <Meter layout="inline" label="Storage" value={72} valueText="72%" />
      <Meter layout="inline" label="Seats" value={8} max={10} valueText="8 of 10" />
    </Column>
  );
}
