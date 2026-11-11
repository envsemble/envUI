import { useState } from 'react';
import { PanelDock, Surface, Text, type PanelDockPanel } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import type { TileWindow } from './Tiles';

const minimize = '.env-panel-dock-panel[data-panel-id="notes"] [aria-label="Minimize"]';
const notesTab = '.env-panel-dock-tab[data-panel-id="notes"] .env-panel-dock-tab-restore';

/**
 * Minimizes the open panel to its tab at the bottom of the window, and brings it back from there,
 * each held a while once it has settled, so neither state is seen only in motion.
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
 * The panel is as tall as its header and one line of notes, with room below, so its content fits
 * and never scrolls and its line doesn't sit on the region's bottom edge. It takes most of the
 * region's width: narrower than a header that keeps its window controls beside the title, so they
 * take their own row above it, as in any narrow panel.
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
 * The region the panels dock in, the page under its top line, filling its card (TileStage.tsx). The
 * open panel stands on its bottom edge, at the end, as on a desktop. Its dock is wider than
 * `stackBelow`, so the open panel keeps its own width there.
 */
const region = { position: 'relative', blockSize: '100%', overflow: 'hidden' } as const;

/**
 * The tiles' window (Tile.css), as a piece of an application's frame: it fills its card in a
 * browser's window (`app`).
 */
export const tileWindow: TileWindow = { app: {} };

/**
 * A notes panel docked at the bottom end of a page, at rest, whose tab takes its place there when
 * it is minimized, uncovering the page beneath it. When the tile stops, it puts its panel back
 * rather than being drawn again, which would make the notes appear with motion again.
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
        // The only panel keeps its resting look: the accent edge marks the front panel among
        // several.
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
