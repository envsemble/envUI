import { Button, Column, Page, PageHeader, Text } from '@envsemble/envui';

const sections = ['Summary', 'Revenue', 'Costs', 'Outlook'];

export default function Sticky() {
  return (
    // A box that scrolls stands in for the window; the header sticks at its top edge.
    <div style={{ blockSize: '18rem', overflow: 'auto' }}>
      <Page
        width="md"
        header={
          <PageHeader
            headingLevel={3}
            sticky
            title="Annual report"
            actions={<Button variant="secondary">Download</Button>}
          />
        }
      >
        <Column gap={6}>
          {sections.map((section) => (
            <Column key={section} gap={2} render={<section />}>
              <Text variant="title" render={<h4 />}>
                {section}
              </Text>
              <Text>The header stays at the top of the page as it scrolls.</Text>
            </Column>
          ))}
        </Column>
      </Page>
    </div>
  );
}
