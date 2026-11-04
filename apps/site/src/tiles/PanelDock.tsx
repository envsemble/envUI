import { useState } from 'react';
import { PanelDock, Text, type PanelDockPanel } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

const minimize = '.env-panel-dock-panel[data-panel-id="notes"] [aria-label="Minimize"]';
const notesTab = '.env-panel-dock-tab[data-panel-id="notes"] .env-panel-dock-tab-restore';

/** The open panel minimized to a tab beside the other one, and brought back from its tab. */
const script: PointerStep[] = [
  { wait: 500 },
  { to: minimize },
  { wait: 300 },
  { click: true },
  { wait: 600 },
  { to: notesTab, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 800 },
  { leave: true },
  { wait: 500 },
];

const start: PanelDockPanel[] = [
  {
    id: 'notes',
    title: 'Notes',
    mode: 'open',
    active: true,
    height: 10.5,
    preferredWidth: 12,
    minWidth: 12,
  },
  // After the notes, so its tab keeps its place at the end as the notes' tab comes and goes.
  { id: 'budget', title: 'Budget', mode: 'minimized' },
];

/** The window the panels dock in, outlined, so the bottom edge they stand on shows. */
const edges = {
  position: 'relative',
  inlineSize: '15.5rem',
  blockSize: '12rem',
  boxSizing: 'border-box',
  border: '0.0625rem solid var(--env-color-border-muted)',
  overflow: 'hidden',
} as const;

/**
 * A notes panel docked at the bottom edge of a window, with a budget minimized to a tab beside it.
 * Stopped, it puts its panels back rather than being drawn anew, which would raise the notes in
 * again.
 */
export default function PanelDockTile() {
  const [panels, setPanels] = useState(start);
  usePointer(script, { onRest: () => setPanels(start) });
  return (
    <div style={edges}>
      <PanelDock.Root
        panels={panels}
        stackBelow="10rem"
        onModeChange={(id, mode) =>
          setPanels((current) =>
            current.map((panel) => (panel.id === id ? { ...panel, mode } : panel)),
          )
        }
        onClose={() => {}}
        onActivate={(id) =>
          setPanels((current) => current.map((panel) => ({ ...panel, active: panel.id === id })))
        }
      >
        {(panel) => (
          <>
            <PanelDock.Header title={panel.title} />
            <Text emphasis="muted" style={{ padding: '0 1.5rem 1.5rem' }}>
              Moves to May.
            </Text>
          </>
        )}
      </PanelDock.Root>
    </div>
  );
}
