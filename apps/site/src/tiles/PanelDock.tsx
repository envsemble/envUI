import { useState } from 'react';
import { PanelDock, Surface, Text, type PanelDockPanel } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

const minimize = '.env-panel-dock-panel[data-panel-id="notes"] [aria-label="Minimize"]';
const notesTab = '.env-panel-dock-tab[data-panel-id="notes"] .env-panel-dock-tab-restore';

/**
 * The open panel minimized to its tab at the window's foot, and brought back from it, each held a
 * while once it has settled, so neither is seen only on its way.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: minimize, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 900 },
  { to: notesTab, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 1100 },
  { leave: true },
  { wait: 450 },
];

/**
 * The panel as tall as its header and one line of notes with room below it, so its content fits it
 * and never scrolls and its line doesn't sit on the region's bottom edge, and most of the region's
 * width: narrower than a header that keeps its window controls beside the title, so they take
 * their row above it, as in any narrow panel.
 */
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

/**
 * The region the panels dock in, the page under its top line, filling its card (AppTile.tsx): the
 * open panel stands on its bottom edge, at the end, as on a desktop. Its dock is wider than
 * `stackBelow`, so the open panel keeps its own width there.
 */
const region = { position: 'relative', blockSize: '100%', overflow: 'hidden' } as const;

/**
 * A notes panel docked at the bottom end of a page, at rest, whose tab takes its place there
 * minimized, uncovering the page beneath it. Stopped, it puts its panel back rather than being
 * drawn anew, which would raise the notes in again.
 */
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
        // The one panel keeps its resting look: the accent edge marks the front one of several.
        onActivate={() => {}}
      >
        {(panel) => (
          <>
            <PanelDock.Header title={panel.title} />
            {/* The body's inset lines up with the header's title. */}
            <Text variant="body-sm" emphasis="muted" style={{ padding: '0 1.25rem 0.5rem' }}>
              Check the logo.
            </Text>
          </>
        )}
      </PanelDock.Root>
    </Surface>
  );
}
