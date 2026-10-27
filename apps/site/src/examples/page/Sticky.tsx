import { Button, Column, Page, PageHeader, Text } from '@envsemble/envui';

const sections = [
  {
    title: 'Summary',
    text: 'Northwind grew in every region this year, with 1,240 new customers and two new offices.',
  },
  {
    title: 'Revenue',
    text: 'Revenue rose 18% to 4.2 million, led by the annual plans that launched in March.',
  },
  {
    title: 'Costs',
    text: 'Costs rose 9%, mostly for the support team, which doubled to meet the new demand.',
  },
  {
    title: 'Outlook',
    text: 'Next year, the mobile release and the data migration are the two largest projects.',
  },
];

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
          {sections.map(({ title, text }) => (
            <Column key={title} gap={2} render={<section />}>
              <Text variant="title" render={<h4 />}>
                {title}
              </Text>
              <Text>{text}</Text>
            </Column>
          ))}
        </Column>
      </Page>
    </div>
  );
}
