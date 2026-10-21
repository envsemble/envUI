import { Column, DatePicker } from '@envsemble/envui';

export default function Variants() {
  return (
    // As wide as a form column.
    <Column gap={5} style={{ inlineSize: 'min(100%, 20rem)' }}>
      <DatePicker label="Publish on" defaultValue="2026-10-20" />
      <DatePicker label="Meeting" granularity="minute" defaultValue="2026-10-21T09:30" />
      <DatePicker variant="floating" label="Last day" defaultValue="2026-10-30" />
    </Column>
  );
}
