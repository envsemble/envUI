import { useState } from 'react';
import { PanelDock, Surface, Text, type PanelDockPanel } from '@envsemble/envui';

export default function ShortTabLabels() {
  // A short label for the tab, and the full title as its tooltip.
  const [panels, setPanels] = useState<PanelDockPanel[]>([
    {
      id: 'budget',
      title: 'Budget for the spring launch',
      label: 'Budget',
      tooltip: 'Budget for the spring launch',
      mode: 'minimized',
    },
    {
      id: 'press',
      title: 'Press release draft',
      label: 'Press release',
      tooltip: 'Press release draft',
      mode: 'minimized',
    },
  ]);
  return (
    // The dock fills a positioned region with a height.
    <Surface
      background="muted"
      padding={0}
      style={{ position: 'relative', blockSize: '3.25rem', overflow: 'hidden' }}
    >
      <PanelDock.Root
        panels={panels}
        onModeChange={(id, mode) =>
          setPanels((current) =>
            current.map((panel) => (panel.id === id ? { ...panel, mode } : panel)),
          )
        }
        onClose={(id) => setPanels((current) => current.filter((panel) => panel.id !== id))}
      >
        {(panel) => (
          <>
            <PanelDock.Header title={panel.title} />
            <Text style={{ padding: '0 1.5rem 1.5rem' }}>Notes for the launch.</Text>
          </>
        )}
      </PanelDock.Root>
    </Surface>
  );
}
