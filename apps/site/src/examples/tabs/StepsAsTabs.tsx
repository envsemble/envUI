import { Tabs, Text } from '@envsemble/envui';

export default function StepsAsTabs() {
  return (
    // Steps that must be done in order, as tabs: nothing says which comes next.
    <Tabs
      aria-label="New project"
      items={[
        {
          value: 'name',
          label: '1. Name',
          content: <Text>Name the project.</Text>,
        },
        {
          value: 'team',
          label: '2. Team',
          content: <Text>Invite the people who work on it.</Text>,
        },
        {
          value: 'review',
          label: '3. Review',
          content: <Text>Check the details and create it.</Text>,
        },
      ]}
    />
  );
}
