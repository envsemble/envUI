import { Button, Tabs, Text } from '@envsemble/envui';

const views = ['Summary', 'Files', 'Activity', 'Members', 'Settings'];

export default function ScrollingRail() {
  return (
    // Tabs keep their size: a rail with more tabs than fit scrolls sideways.
    <Tabs
      aria-label="Project views"
      items={views.map((view) => ({
        value: view,
        button: <Button>{view}</Button>,
        content: <Text>The project's {view.toLowerCase()}.</Text>,
      }))}
    />
  );
}
