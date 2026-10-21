import { Column, Surface, Text } from '@envsemble/envui';

export default function NestedSurfaces() {
  return (
    <Surface padding={5} render={<Column gap={4} />}>
      <Text render={<h3 />} variant="title">
        Billing
      </Text>
      <Surface background="muted" padding={4} render={<Column gap={3} />}>
        <Surface background="raised" radius="sm" padding={4} render={<Column gap={1} />}>
          <Text variant="body-sm">Next invoice</Text>
          <Text>€240.00 on 1 April</Text>
        </Surface>
      </Surface>
      <Text variant="body-sm">Invoices go to billing@example.com.</Text>
    </Surface>
  );
}
