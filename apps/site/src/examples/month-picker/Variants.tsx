import { Column, MonthPicker } from '@envsemble/envui';

export default function Variants() {
  return (
    // As wide as a form column.
    <Column gap={5} style={{ inlineSize: 'min(100%, 16rem)' }}>
      <MonthPicker label="Report month" defaultValue="2026-10" />
      <MonthPicker variant="floating" label="Billing period" defaultValue="2026-11" />
    </Column>
  );
}
