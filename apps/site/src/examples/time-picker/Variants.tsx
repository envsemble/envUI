import { Column, TimePicker } from '@envsemble/envui';

export default function Variants() {
  return (
    // As wide as a form column.
    <Column gap={5} style={{ inlineSize: 'min(100%, 16rem)' }}>
      <TimePicker label="Starts at" defaultValue="09:30" />
      <TimePicker variant="floating" label="Ends at" defaultValue="17:00" />
    </Column>
  );
}
