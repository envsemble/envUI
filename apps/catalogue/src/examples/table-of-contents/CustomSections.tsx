import { Card, Column, Row, TableOfContents, Text } from '@envsemble/envui';

const results = [
  { id: 'review-revenue', title: 'Revenue', value: '€1.2m, up 8%' },
  { id: 'review-costs', title: 'Costs', value: '€0.9m, down 3%' },
];

export default function CustomSections() {
  return (
    <Row gap={5} align="start" style={{ inlineSize: '100%' }}>
      {/* The sections are cards, not headings: the contents names each in words of its own. */}
      <TableOfContents
        aria-label="Sections of the review"
        style={{ inlineSize: '9rem', flexShrink: 0 }}
        items={[
          { id: 'review-summary', label: 'Summary' },
          {
            id: 'review-results',
            label: 'Results',
            children: results.map(({ id, title }) => ({ id, label: title })),
          },
          { id: 'review-outlook', label: 'Outlook' },
        ]}
      />
      <Column
        gap={4}
        tabIndex={0}
        role="region"
        aria-label="Annual review"
        style={{ flex: 1, minInlineSize: 0, blockSize: '18rem', overflow: 'auto' }}
      >
        <Card id="review-summary" title="The year in brief">
          <Text>A steady year: more customers, lower costs.</Text>
        </Card>
        <Column id="review-results" gap={4}>
          {results.map(({ id, title, value }) => (
            <Card key={id} id={id} title={title}>
              <Text>{value}</Text>
            </Card>
          ))}
        </Column>
        <Card id="review-outlook" title="Next year">
          <Text>Two new regions and a mobile release.</Text>
        </Card>
      </Column>
    </Row>
  );
}
