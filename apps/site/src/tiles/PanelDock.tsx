import { useState } from 'react';
import { PanelDock, Surface, Text, type PanelDockPanel } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useHeldView, useMustShow, usePointer, type PointerStep } from '../motion/Motion';
import { outlined } from './Outline';
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

/**
 * The panel as tall as its header and one line of notes, so its content fits it and never scrolls,
 * and most of the region's width: narrower than a header that keeps its window controls beside the
 * title, so they take their row above it, as in any narrow panel.
 */
const start: PanelDockPanel[] = [
  {
    id: 'notes',
    title: 'Notes',
    mode: 'open',
    preferredWidth: 9.75,
    minWidth: 8.5,
    height: 6.625,
    minHeight: 6.625,
  },
];

/**
 * The region the panels dock in, a surface outlined so its bottom edge shows, under the top line of
 * its page: the open panel stands on its bottom edge below that line, so no text lies under the
 * panel, and the region is as low as the line and the panel. It shows whole, drawn a little smaller
 * where its stage is lower (useHeldView, with the panel named to show); on a phone's narrower
 * tile, narrower. Its dock is wider than `stackBelow`, so the open panel keeps its own width at the
 * bottom inline-end edge, as on a desktop.
 */
const region = {
  ...outlined,
  position: 'relative',
  inlineSize: '12.25rem',
  blockSize: '8.125rem',
  overflow: 'hidden',
} as const;
const narrowRegion = { ...region, inlineSize: '11rem' } as const;

/**
 * A notes panel docked at the bottom end of a page, at rest, whose tab takes its place there
 * minimized, uncovering the page beneath it. Stopped, it puts its panel back rather than being
 * drawn anew, which would raise the notes in again.
 */
export default function PanelDockTile() {
  const [panels, setPanels] = useState(start);
  const narrow = useMedia(narrowGallery);
  useHeldView();
  useMustShow('.env-panel-dock-panel');
  usePointer(script, { onRest: () => setPanels(start) });
  return (
    <Surface background="default" radius="sm" padding={1} style={narrow ? narrowRegion : region}>
      <Text variant="caption" style={{ whiteSpace: 'nowrap' }}>
        Launch plan, due in May
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
