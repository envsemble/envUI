import { Button, Tabs, Text } from '@envsemble/envui';

export default function ShortTabNames() {
  return (
    <Tabs
      aria-label="Report views"
      items={[
        { value: 'revenue', button: <Button>Revenue</Button>, content: <Text>By region.</Text> },
        { value: 'costs', button: <Button>Costs</Button>, content: <Text>By team.</Text> },
        { value: 'outlook', button: <Button>Outlook</Button>, content: <Text>Next year.</Text> },
      ]}
    />
  );
}
