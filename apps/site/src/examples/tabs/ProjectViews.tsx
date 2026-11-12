import { Column, Tabs, Text } from '@envsemble/envui';

export default function ProjectViews() {
  return (
    <Tabs
      aria-label="Project views"
      keepMounted
      items={[
        {
          value: 'summary',
          label: 'Summary',
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
          label: 'Details',
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
          label: 'Activity',
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
