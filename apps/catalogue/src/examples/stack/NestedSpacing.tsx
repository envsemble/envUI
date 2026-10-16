import { Stack, Text, TextField } from '@envsemble/envui';

export default function NestedSpacing() {
  return (
    <Stack gap={6}>
      <Stack gap={4}>
        <Stack gap={1}>
          <Text as="h3" variant="section-heading">
            Contact
          </Text>
          <Text variant="supporting">Where we send receipts and account notices.</Text>
        </Stack>
        <TextField label="Name" defaultValue="Alex Morgan" />
        <TextField label="E-mail address" type="email" defaultValue="alex@example.com" />
      </Stack>
      <Stack gap={4}>
        <Stack gap={1}>
          <Text as="h3" variant="section-heading">
            Company
          </Text>
          <Text variant="supporting">Shown on invoices.</Text>
        </Stack>
        <TextField label="Company name" defaultValue="Northwind" />
      </Stack>
    </Stack>
  );
}
