import { useState } from 'react';
import { Column, PanelDock, Text, type PanelDockPanel } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

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
    preferredWidth: 7,
    minWidth: 7,
  },
];

/**
 * The window the panels dock in, outlined, so the bottom edge they stand on shows, over a few rows
 * of its page: as low as a gallery's tile shows whole at its own size; on a phone's narrower tile,
 * narrower, so it is drawn at about its own size there too. Its dock is narrower than `stackBelow`,
 * so the open panel fills it, as one does in a narrow window: its header, the title under the
 * window controls, and its note's one line, above the bottom edge.
 */
const edges = {
  position: 'relative',
  inlineSize: '12rem',
  blockSize: '6.75rem',
  padding: '0.5rem 0.75rem',
  boxSizing: 'border-box',
  border: '0.0625rem solid var(--env-color-border-muted)',
  overflow: 'hidden',
} as const;
const narrowEdges = {
  ...edges,
  inlineSize: '10rem',
  blockSize: '6.5rem',
  paddingInline: '0.5rem',
} as const;

const rows = ['Plan', 'Team', 'Docs'];
const narrowRows = ['Q1', 'Q2', 'Q3'];

/**
 * A notes panel docked at the bottom edge of a window, at rest, whose tab takes its place there
 * minimized, uncovering the page. Stopped, it puts its panels back rather than being drawn anew, which would raise the
 * notes in again.
 */
export default function PanelDockTile() {
  const [panels, setPanels] = useState(start);
  const narrow = useMedia(narrowGallery);
  usePointer(script, { onRest: () => setPanels(start) });
  return (
    <div style={narrow ? narrowEdges : edges}>
      <Column gap={2}>
        {(narrow ? narrowRows : rows).map((row) => (
          <Text key={row} variant="body-sm" style={{ whiteSpace: 'nowrap' }}>
            {row}
          </Text>
        ))}
      </Column>
      <PanelDock.Root
        panels={panels}
        stackBelow="16rem"
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
            <Text emphasis="muted" style={{ paddingInline: '1.25rem 0.75rem' }}>
              Moves to May.
            </Text>
          </>
        )}
      </PanelDock.Root>
    </div>
  );
}
