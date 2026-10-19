import { Button, Surface, Tabs, Text } from '@envsemble/envui';

function View({ children }: { children: string }) {
  return (
    // The view fills the panel; a canvas would draw here.
    <Surface background="muted" style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
      <Text emphasis="muted">{children}</Text>
    </Surface>
  );
}

export default function FillARegion() {
  return (
    // The region has a height of its own, as an application's layout gives it.
    <div style={{ display: 'flex', flexDirection: 'column', blockSize: '16rem' }}>
      <Tabs
        aria-label="Diagram views"
        fill
        style={{ flex: 1 }}
        items={[
          {
            value: 'canvas',
            button: <Button>Canvas</Button>,
            content: <View>The canvas fills the panel</View>,
          },
          { value: 'outline', button: <Button>Outline</Button>, content: <View>Outline</View> },
        ]}
      />
    </div>
  );
}
