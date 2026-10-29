import { Tabs, Text } from '@envsemble/envui';

export default function TabsAnatomy() {
  return (
    <Tabs
      aria-label="Project views"
      items={[
        {
          value: 'summary',
          label: 'Summary',
          content: <Text>Plans and owners for the launch.</Text>,
        },
        { value: 'files', label: 'Files', content: <Text>Twelve files.</Text> },
      ]}
    />
  );
}
