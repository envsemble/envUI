import { useState } from 'react';
import {
  PanelDock,
  Surface,
  Text,
  type PanelDockMode,
  type PanelDockPanel,
} from '@envsemble/envui';

export default function MinimizeWhatDoesNotFit() {
  // The newest panel is last and active; the first was active longest ago.
  const [panels, setPanels] = useState<PanelDockPanel[]>([
    { id: 'queue', title: 'Support queue', mode: 'open', height: 15 },
    { id: 'checklist', title: 'Release checklist', mode: 'open', height: 15 },
    { id: 'hiring', title: 'Hiring plan', mode: 'open', height: 15, active: true },
  ]);
  const update = (change: (panel: PanelDockPanel) => PanelDockPanel) =>
    setPanels((current) => current.map(change));
  const changeMode = (id: string, mode: PanelDockMode) =>
    update((panel) =>
      panel.id === id
        ? { ...panel, mode }
        : mode === 'maximized' && panel.mode === 'maximized'
          ? { ...panel, mode: 'open' }
          : panel,
    );
  return (
    // A region too narrow for three panels at their minimum width of 20 rem.
    <Surface
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
            {/* The body's inset lines up with the header's title. */}
            <Text emphasis="muted" style={{ padding: '0 1.5rem 1.5rem' }}>
              Shared with the team.
            </Text>
          </>
        )}
      </PanelDock.Root>
    </Surface>
  );
}
