import { Card, Tabs, Text } from '@envsemble/envui';

export default function ListBesideAHeading() {
  return (
    <Card>
      <Tabs
        aria-label="Orders"
        size="sm"
        renderList={(list) => (
          // The heading and the list share a row; the panels follow below.
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            <Text render={<h3 />} variant="title">
              Orders
            </Text>
            {list}
          </div>
        )}
        items={[
          {
            value: 'recent',
            label: 'Recent',
            content: <Text>Northwind ordered 40 chairs today.</Text>,
          },
          {
            value: 'returned',
            label: 'Returned',
            content: <Text>Sam Lee returned a desk on Monday.</Text>,
          },
        ]}
      />
    </Card>
  );
}
