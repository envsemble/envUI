import { Button, Stack, Tabs, Text } from '@envsemble/envui';

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
            <Stack gap={2}>
              <Text render={<h3 />} variant="title">
                Northwind launch
              </Text>
              <Text>A shared space for the launch plan, its budget and the team's notes.</Text>
            </Stack>
          ),
        },
        {
          value: 'details',
          button: <Button>Details</Button>,
          content: (
            <Stack gap={2}>
              <Text render={<h3 />} variant="title">
                Details
              </Text>
              <Text>Owned by Priya Shah. The plan is ready for review by Friday.</Text>
            </Stack>
          ),
        },
        {
          value: 'activity',
          button: <Button>Activity</Button>,
          content: (
            <Stack gap={2}>
              <Text render={<h3 />} variant="title">
                Activity
              </Text>
              <Text>Sam Lee updated the budget today.</Text>
            </Stack>
          ),
        },
      ]}
    />
  );
}
