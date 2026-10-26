import { Button, Tabs, Text } from '@envsemble/envui';

export default function StepsAsTabs() {
  return (
    // Steps that must be done in order, as tabs: nothing says which comes next.
    <Tabs
      aria-label="New project"
      items={[
        {
          value: 'name',
          button: <Button>1. Name</Button>,
          content: <Text>Name the project.</Text>,
        },
        {
          value: 'team',
          button: <Button>2. Team</Button>,
          content: <Text>Invite the people who work on it.</Text>,
        },
        {
          value: 'review',
          button: <Button>3. Review</Button>,
          content: <Text>Check the details and create it.</Text>,
        },
      ]}
    />
  );
}
