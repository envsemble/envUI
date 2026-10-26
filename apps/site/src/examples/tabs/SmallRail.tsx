import { Button, Tabs, Text, Badge } from '@envsemble/envui';

export default function SmallRail() {
  return (
    <Tabs
      aria-label="Requests"
      size="sm"
      items={[
        {
          value: 'open',
          button: (
            <Button>
              Open <Badge count={8} />
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
