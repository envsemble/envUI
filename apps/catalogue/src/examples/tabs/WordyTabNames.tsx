import { Button, Tabs, Text } from '@envsemble/envui';

export default function WordyTabNames() {
  return (
    <Tabs
      aria-label="Report views"
      items={[
        {
          value: 'revenue',
          button: <Button>Revenue for every region</Button>,
          content: <Text>By region.</Text>,
        },
        {
          value: 'costs',
          button: <Button>What we spent</Button>,
          content: <Text>By team.</Text>,
        },
        {
          value: 'outlook',
          button: <Button>Looking ahead to next year</Button>,
          content: <Text>Next year.</Text>,
        },
      ]}
    />
  );
}
