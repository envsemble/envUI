import { useState } from 'react';
import {
  PanelDock,
  Surface,
  Text,
  type PanelDockMode,
  type PanelDockPanel,
} from '@envsemble/envui';

const notes: Record<string, string> = {
  plan: 'The launch moves to the first week of May.',
  press: 'Northwind asked for a quote from Priya Shah by Friday.',
  pricing: 'Two plans, monthly and yearly, with a free trial of 14 days.',
};

export default function MaximizedPanel() {
  const [panels, setPanels] = useState<PanelDockPanel[]>([
    { id: 'plan', title: 'Launch plan', mode: 'maximized', active: true, preferredWidth: 20 },
    { id: 'press', title: 'Press release', mode: 'open', height: 16.25, preferredWidth: 20 },
    { id: 'pricing', title: 'Pricing', mode: 'minimized' },
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
      style={{ position: 'relative', blockSize: '30rem', overflow: 'hidden' }}
    >
      <PanelDock.Root
        panels={panels}
        onModeChange={changeMode}
        onClose={(id) => setPanels((current) => current.filter((panel) => panel.id !== id))}
        onActivate={(id) => update((panel) => ({ ...panel, active: panel.id === id }))}
        onHeightChange={(id, height) =>
          update((panel) => (panel.id === id ? { ...panel, height } : panel))
        }
      >
        {(panel) => (
          <>
            <PanelDock.Header title={panel.title} meta="Edited by Alex Morgan" />
            <Text style={{ padding: '0 1.5rem 1.5rem' }}>{notes[panel.id]}</Text>
          </>
        )}
      </PanelDock.Root>
    </Surface>
  );
}
