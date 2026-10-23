import { Column, TextField } from '@envsemble/envui';
import { Sell } from '@envsemble/envui/icons/Sell';

export default function PrefixAndSuffix() {
  return (
    // As wide as a form column.
    <Column gap={4} style={{ inlineSize: 'min(100%, 24rem)' }}>
      <TextField
        label="Address"
        name="slug"
        prefix="https://example.com/"
        defaultValue="quarterly-report"
      />
      <TextField label="Storage" name="storage" type="number" suffix="GB" defaultValue="20" />
      <TextField
        showLabel={false}
        label="Price"
        name="price"
        inputMode="decimal"
        placeholder="0.00"
        prefix="€"
        suffix="per month"
        startIcon={<Sell />}
      />
    </Column>
  );
}
