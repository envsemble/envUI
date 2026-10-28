import { Column, TextField } from '@envsemble/envui';

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
    </Column>
  );
}
