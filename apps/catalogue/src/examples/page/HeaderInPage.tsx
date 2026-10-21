import { Page, PageHeader, Surface, Text } from '@envsemble/envui';

export default function HeaderInPage() {
  return (
    // header shares the page's column and gutter, so the title lines up with the content.
    <Surface background="muted" padding={0}>
      <Page width="sm" header={<PageHeader title="Invoices" headingLevel={3} />}>
        <Text>Four invoices are due this month.</Text>
      </Page>
    </Surface>
  );
}
