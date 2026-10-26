import { Column, Text, TextField } from '@envsemble/envui';

export default function NestedSpacing() {
  return (
    <Column gap={7}>
      <Column gap={3}>
        <Column gap={1}>
          <Text render={<h3 />} variant="title">
            Contact
          </Text>
          <Text variant="body-sm">Where we send receipts and account notices.</Text>
        </Column>
        <TextField label="Name" defaultValue="Alex Morgan" />
        <TextField label="E-mail address" type="email" defaultValue="alex@example.com" />
      </Column>
      <Column gap={3}>
        <Column gap={1}>
          <Text render={<h3 />} variant="title">
            Company
          </Text>
          <Text variant="body-sm">Shown on invoices.</Text>
        </Column>
        <TextField label="Company name" defaultValue="Northwind" />
      </Column>
    </Column>
  );
}
