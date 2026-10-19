import { Button, Menu, Menubar, Stack, Text, WindowFrame } from '@envsemble/envui';

const recent = ['Roadmap', 'Pricing research', 'Launch checklist', 'Interview notes', 'Budget'];

/** Stands in for the window, which WindowFrame fills. */
const frame = {
  position: 'relative',
  blockSize: '16rem',
  overflow: 'hidden',
  borderRadius: '1.75rem',
  transform: 'translateZ(0)',
} as const;

export default function StartPageWindow() {
  return (
    <div style={frame}>
      <WindowFrame.Root>
        <WindowFrame.TitleBar
          start={
            <Menubar.Root aria-label="Start page menu">
              <Menubar.Menu label="File">
                <Menu.Item shortcut="Ctrl+O">Open…</Menu.Item>
              </Menubar.Menu>
            </Menubar.Root>
          }
          end={<Button variant="secondary">Share</Button>}
        >
          Northwind
        </WindowFrame.TitleBar>
        <WindowFrame.Content>
          <Stack gap={2} style={{ padding: '1.5rem' }}>
            <Text render={<h3 />} variant="headline">
              Recent documents
            </Text>
            {recent.map((name) => (
              <Text key={name} emphasis="muted">
                {name}
              </Text>
            ))}
          </Stack>
        </WindowFrame.Content>
      </WindowFrame.Root>
    </div>
  );
}
