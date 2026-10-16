import { Button, CounterBadge, Tabs, Text } from '@envsemble/envui';

export default function CompactSize() {
  return (
    <Tabs
      aria-label="Requests"
      size="compact"
      items={[
        {
          value: 'open',
          button: (
            <Button>
              Open <CounterBadge value={8} />
            </Button>
          ),
          content: <Text>Eight requests wait for a review.</Text>,
        },
        {
          value: 'approved',
          button: <Button>Approved</Button>,
          content: <Text>Requests approved this month.</Text>,
        },
        {
          value: 'declined',
          button: <Button>Declined</Button>,
          content: <Text>Requests declined this month.</Text>,
        },
      ]}
    />
  );
}
