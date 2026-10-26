import { Button, Column, Tabs, Text } from '@envsemble/envui';

export default function ProjectViews() {
  return (
    <Tabs
      aria-label="Project views"
      keepMounted
      items={[
        {
          value: 'summary',
          button: <Button>Summary</Button>,
          content: (
            <Column gap={2}>
              <Text render={<h3 />} variant="title">
                Northwind launch
              </Text>
              <Text>A shared space for the launch plan, its budget and the team's notes.</Text>
            </Column>
          ),
        },
        {
          value: 'details',
          button: <Button>Details</Button>,
          content: (
            <Column gap={2}>
              <Text render={<h3 />} variant="title">
                Details
              </Text>
              <Text>Owned by Priya Shah. The plan is ready for review by Friday.</Text>
            </Column>
          ),
        },
        {
          value: 'activity',
          button: <Button>Activity</Button>,
          content: (
            <Column gap={2}>
              <Text render={<h3 />} variant="title">
                Activity
              </Text>
              <Text>Sam Lee updated the budget today.</Text>
            </Column>
          ),
        },
      ]}
    />
  );
}
