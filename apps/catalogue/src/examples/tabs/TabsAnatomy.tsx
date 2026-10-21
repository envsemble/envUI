import { Button, Tabs, Text } from '@envsemble/envui';

export default function TabsAnatomy() {
  return (
    <Tabs
      aria-label="Project views"
      items={[
        {
          value: 'summary',
          button: <Button>Summary</Button>,
          content: <Text>Plans and owners for the launch.</Text>,
        },
        { value: 'files', button: <Button>Files</Button>, content: <Text>Twelve files.</Text> },
      ]}
    />
  );
}
