import { useState } from 'react';
import { Column, PanelDock, Text, type PanelDockPanel } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

const minimize = '.env-panel-dock-panel[data-panel-id="notes"] [aria-label="Minimize"]';
const notesTab = '.env-panel-dock-tab[data-panel-id="notes"] .env-panel-dock-tab-restore';

/** The open panel minimized to its tab at the window's foot, and brought back from it. */
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
    height: 4.25,
    preferredWidth: 7.25,
    minWidth: 7,
  },
];

/**
 * The window the panels dock in, outlined, so the bottom edge they stand on shows, a few rows of
 * its page beside the panel: as low as a gallery's tile shows whole at its own size.
 */
const edges = {
  position: 'relative',
  inlineSize: '12rem',
  blockSize: '6rem',
  padding: '0.5rem 0.75rem',
  boxSizing: 'border-box',
  border: '0.0625rem solid var(--env-color-border-muted)',
  overflow: 'hidden',
} as const;

const rows = ['Launch', 'Budget', 'Hiring'];

/**
 * A notes panel docked at the bottom edge of a window, at rest, whose tab takes its place there
 * minimized. Stopped, it puts its panels back rather than being drawn anew, which would raise the
 * notes in again.
 */
export default function PanelDockTile() {
  const [panels, setPanels] = useState(start);
  usePointer(script, { onRest: () => setPanels(start) });
  return (
    <div style={edges}>
      <Column gap={2}>
        {rows.map((row) => (
          <Text key={row} variant="body-sm" style={{ whiteSpace: 'nowrap' }}>
            {row}
          </Text>
        ))}
      </Column>
      <PanelDock.Root
        panels={panels}
        stackBelow="10rem"
        onModeChange={(id, mode) =>
          setPanels((current) =>
            current.map((panel) => (panel.id === id ? { ...panel, mode } : panel)),
          )
        }
        onClose={() => {}}
        // The one panel keeps its resting look: the accent edge marks the front one of several.
        onActivate={() => {}}
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
