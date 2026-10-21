import { useState } from 'react';
import { Button, PanelDock, Surface, Text, type PanelDockPanel } from '@envsemble/envui';

export default function PanelDockAnatomy() {
  const [panels, setPanels] = useState<PanelDockPanel[]>([
    { id: 'press', title: 'Press release', mode: 'open', active: true, height: 220 },
    { id: 'budget', title: 'Budget', mode: 'minimized' },
  ]);
  return (
    // The dock fills a positioned region with a height.
    <Surface
      background="muted"
      padding={0}
      style={{ position: 'relative', blockSize: '22rem', overflow: 'hidden' }}
    >
      <PanelDock.Root
        panels={panels}
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
