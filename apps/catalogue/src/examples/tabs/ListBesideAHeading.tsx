import { Button, Card, Tabs, Text } from '@envsemble/envui';

export default function ListBesideAHeading() {
  return (
    <Card>
      <Tabs
        aria-label="Orders"
        size="compact"
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
            <Text as="h3" variant="section-heading">
              Orders
            </Text>
            {list}
          </div>
        )}
        items={[
          {
            value: 'recent',
            button: <Button>Recent</Button>,
            content: <Text>Northwind ordered 40 chairs today.</Text>,
          },
          {
            value: 'returned',
            button: <Button>Returned</Button>,
            content: <Text>Sam Lee returned a desk on Monday.</Text>,
          },
        ]}
      />
    </Card>
  );
}
