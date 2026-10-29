import { useState } from 'react';
import { Button, PanelDock, Surface, Text, type PanelDockPanel } from '@envsemble/envui';

export default function PanelDockAnatomy() {
  const [panels, setPanels] = useState<PanelDockPanel[]>([
    { id: 'press', title: 'Press release', mode: 'open', active: true, height: 12.5 },
    { id: 'budget', title: 'Budget', mode: 'minimized' },
  ]);
  return (
    // The dock fills a positioned region with a height; a small one, which shows its panels side
    // by side from 30 rem rather than 40.
    <Surface
      background="muted"
      padding={0}
      style={{
        position: 'relative',
        blockSize: '17rem',
        inlineSize: 'min(100%, 34rem)',
        overflow: 'hidden',
      }}
    >
      <PanelDock.Root
        panels={panels}
        stackBelow="30rem"
        onModeChange={(id, mode) =>
          setPanels((current) =>
            current.map((panel) => (panel.id === id ? { ...panel, mode } : panel)),
          )
        }
        onClose={(id) => setPanels((current) => current.filter((panel) => panel.id !== id))}
        onActivate={(id) =>
          setPanels((current) => current.map((panel) => ({ ...panel, active: panel.id === id })))
        }
        onHeightChange={(id, height) =>
          setPanels((current) =>
            current.map((panel) => (panel.id === id ? { ...panel, height } : panel)),
          )
        }
      >
        {(panel) => (
          <>
            <PanelDock.Header
              title={panel.title}
              meta="Edited by Alex Morgan"
              actions={<Button size="sm">Publish</Button>}
            />
            <Text style={{ padding: '0 1.5rem 1.5rem' }}>The launch moves to May.</Text>
          </>
        )}
      </PanelDock.Root>
    </Surface>
  );
}
