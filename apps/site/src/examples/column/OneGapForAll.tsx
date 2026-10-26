import { Column, Text, TextField } from '@envsemble/envui';

export default function OneGapForAll() {
  return (
    // One gap between everything: the sections and their content run together.
    <Column gap={4}>
      <Text render={<h3 />} variant="title">
        Contact
      </Text>
      <Text variant="body-sm">Where we send receipts and account notices.</Text>
      <TextField label="Name" defaultValue="Alex Morgan" />
      <TextField label="E-mail address" type="email" defaultValue="alex@example.com" />
      <Text render={<h3 />} variant="title">
        Company
      </Text>
      <Text variant="body-sm">Shown on invoices.</Text>
      <TextField label="Company name" defaultValue="Northwind" />
    </Column>
  );
}
