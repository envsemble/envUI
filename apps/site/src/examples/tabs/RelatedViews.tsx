import { Button, Tabs, Text } from '@envsemble/envui';

export default function RelatedViews() {
  return (
    <Tabs
      aria-label="Project views"
      items={[
        {
          value: 'summary',
          button: <Button>Summary</Button>,
          content: <Text>Plans and owners for the launch.</Text>,
        },
        {
          value: 'files',
          button: <Button>Files</Button>,
          content: <Text>Twelve files, shared with the team.</Text>,
        },
        {
          value: 'activity',
          button: <Button>Activity</Button>,
          content: <Text>Sam Lee updated the budget today.</Text>,
        },
      ]}
    />
  );
}
