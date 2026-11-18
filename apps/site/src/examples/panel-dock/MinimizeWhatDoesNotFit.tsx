import { useState } from 'react';
import {
  PanelDock,
  Surface,
  Text,
  type PanelDockMode,
  type PanelDockPanel,
} from '@envsemble/envui';

export default function MinimizeWhatDoesNotFit() {
  const [panels, setPanels] = useState<PanelDockPanel[]>([
    { id: 'queue', title: 'Support queue', mode: 'open', height: 15 },
    { id: 'checklist', title: 'Release checklist', mode: 'open', height: 15 },
    { id: 'hiring', title: 'Hiring plan', mode: 'open', height: 15, active: true },
  ]);
  const update = (change: (panel: PanelDockPanel) => PanelDockPanel) =>
    setPanels((current) => current.map(change));
  const changeMode = (id: string, mode: PanelDockMode) =>
    update((panel) => {
      if (panel.id === id) return { ...panel, mode };
      const isTheEarlierMaximized = mode === 'maximized' && panel.mode === 'maximized';
      return isTheEarlierMaximized ? { ...panel, mode: 'open' } : panel;
    });
  return (
    <Surface
      radius="none"
      background="muted"
      padding={0}
      style={{
        position: 'relative',
        blockSize: '24rem',
        inlineSize: 'min(100%, 52rem)',
        overflow: 'hidden',
      }}
    >
      <PanelDock.Root
        panels={panels}
        overflow="minimize"
        onModeChange={changeMode}
        onClose={(id) => setPanels((current) => current.filter((panel) => panel.id !== id))}
        onActivate={(id) => update((panel) => ({ ...panel, active: panel.id === id }))}
        onHeightChange={(id, height) =>
          update((panel) => (panel.id === id ? { ...panel, height } : panel))
        }
      >
        {(panel) => (
          <>
            <PanelDock.Header title={panel.title} />
            <Text emphasis="muted" style={{ padding: '0 1.5rem 1.5rem' }}>
              Shared with the team.
            </Text>
          </>
        )}
      </PanelDock.Root>
    </Surface>
  );
}
