import { useState } from 'react';
import {
  PanelDock,
  PanelDockHeader,
  Stack,
  Surface,
  Text,
  type PanelDockMode,
  type PanelDockPanel,
} from '@envsemble/envui';
import { Chat } from '@envsemble/envui/icons/Chat';

const lastMessages: Record<string, string> = {
  sam: 'Sam Lee: The slides are ready for review.',
  priya: 'Priya Shah: Can we move the call to Thursday?',
};

export default function NarrowRegion() {
  const [panels, setPanels] = useState<PanelDockPanel[]>([
    { id: 'sam', title: 'Sam Lee', mode: 'open', icon: <Chat /> },
    { id: 'priya', title: 'Priya Shah', mode: 'open', icon: <Chat />, active: true },
  ]);
  const [stacked, setStacked] = useState(false);
  const update = (change: (panel: PanelDockPanel) => PanelDockPanel) =>
    setPanels((current) => current.map(change));
  const changeMode = (id: string, mode: PanelDockMode) =>
    update((panel) => (panel.id === id ? { ...panel, mode } : panel));
  // The page beneath is out of reach while a panel fills the stacked dock.
  const covered = stacked && panels.some((panel) => panel.mode !== 'minimized');
  return (
    // As narrow as a phone: below stackBelow, 40 rem, one panel at a time fills the region.
    <Surface
      background="muted"
      padding={0}
      style={{
        position: 'relative',
        blockSize: '26rem',
        inlineSize: 'min(100%, 24rem)',
        overflow: 'hidden',
      }}
    >
      <Stack gap={2} inert={covered} style={{ padding: '1.5rem' }}>
        <Text render={<h3 />} variant="title">
          Messages
        </Text>
      </Stack>
      <PanelDock
        panels={panels}
        onModeChange={changeMode}
        onClose={(id) => setPanels((current) => current.filter((panel) => panel.id !== id))}
        onActivate={(id) => update((panel) => ({ ...panel, active: panel.id === id }))}
        onStackedChange={setStacked}
      >
        {(panel) => (
          <>
            <PanelDockHeader title={panel.title} meta="Direct message" />
            {/* The body's inset lines up with the header's title. */}
            <Text style={{ padding: '0 1.5rem 1.5rem' }}>{lastMessages[panel.id]}</Text>
          </>
        )}
      </PanelDock>
    </Surface>
  );
}
