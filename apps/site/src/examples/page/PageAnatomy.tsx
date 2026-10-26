import { Button, Page, PageHeader, Surface, Text } from '@envsemble/envui';

export default function PageAnatomy() {
  return (
    <Surface background="muted" padding={0}>
      <Page
        width="sm"
        header={
          <PageHeader title="Invoices" headingLevel={3} actions={<Button>New invoice</Button>} />
        }
      >
        <Surface background="default" padding={4}>
          <Text>Four invoices are due this month.</Text>
        </Surface>
      </Page>
    </Surface>
  );
}
