import { useState } from 'react';
import { PanelDock, Surface, Text, type PanelDockPanel } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import type { TileWindow } from './Tiles';

const minimize = '.env-panel-dock-panel[data-panel-id="notes"] [aria-label="Minimize"]';
const notesTab = '.env-panel-dock-tab[data-panel-id="notes"] .env-panel-dock-tab-restore';

const script: PointerStep[] = [
  { wait: 300 },
  { to: minimize, duration: 450 },
  { wait: 180 },
  { click: true },
  { wait: 540 },
  { to: notesTab, duration: 450 },
  { wait: 180 },
  { click: true },
  { wait: 660 },
  { leave: true },
  { wait: 270 },
];

const start: PanelDockPanel[] = [
  {
    id: 'notes',
    title: 'Notes',
    mode: 'open',
    preferredWidth: 9.75,
    minWidth: 8.5,
    height: 7.25,
    minHeight: 7.25,
  },
];

const region = { position: 'relative', blockSize: '100%', overflow: 'hidden' } as const;

export const tileWindow: TileWindow = { app: {} };

const keepRestingLook = () => {};

export default function PanelDockTile() {
  const [panels, setPanels] = useState(start);
  usePointer(script, { onRest: () => setPanels(start) });
  return (
    <Surface background="page" radius="none" padding={3} style={region}>
      <Text variant="title">Launch plan</Text>
      <Text variant="body-sm" emphasis="muted">
        Due in May.
      </Text>
      <PanelDock.Root
        panels={panels}
        stackBelow="9rem"
        onModeChange={(id, mode) =>
          setPanels((current) =>
            current.map((panel) => (panel.id === id ? { ...panel, mode } : panel)),
          )
        }
        onClose={() => {}}
        onActivate={keepRestingLook}
      >
        {(panel) => (
          <>
            <PanelDock.Header title={panel.title} />
            <Text variant="body-sm" emphasis="muted" style={{ padding: '0 1.25rem 0.5rem' }}>
              Check the logo.
            </Text>
          </>
        )}
      </PanelDock.Root>
    </Surface>
  );
}
