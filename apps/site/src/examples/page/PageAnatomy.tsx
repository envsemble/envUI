import { Button, Page, PageHeader, Text } from '@envsemble/envui';

export default function PageAnatomy() {
  return (
    <Page
      width="sm"
      header={
        <PageHeader title="Invoices" headingLevel={3} actions={<Button>New invoice</Button>} />
      }
    >
      <Text>Four invoices are due this month.</Text>
    </Page>
  );
}
