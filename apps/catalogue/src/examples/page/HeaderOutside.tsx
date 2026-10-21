import { PageHeader, Page, Surface, Text } from '@envsemble/envui';

export default function HeaderOutside() {
  return (
    // A PageHeader outside the page: it takes neither the column nor the gutter.
    <Surface background="muted" padding={0}>
      <PageHeader title="Invoices" headingLevel={3} />
      <Page width="sm">
        <Text>Four invoices are due this month.</Text>
      </Page>
    </Surface>
  );
}
