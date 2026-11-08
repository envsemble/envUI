import { Button, Card } from '@envsemble/envui';
import { useTimeline } from '../motion/Timeline';
import { outlined } from './Outline';
import type { TileWindow } from './Tiles';

/** A larger window than the tiles' (Tile.css), drawn smaller: the component doesn't fit theirs. */
export const tileWindow: TileWindow = { width: 17, height: 12.75 };

/**
 * Shows the shape of what is coming: a card with its item at rest. While it plays, it loads: its
 * title and its line are given as undefined, so its skeleton draws a bar for each, with their own
 * pulse playing, and then the item arrives in the same place. After a while to read it, it loads
 * again.
 */
export default function LoadingTile() {
  // Across the loop: the still, loading, the item, loading again, and the item a while longer.
  const step = useTimeline([400, 2000, 2700, 2000, 4000]);
  const loaded = step % 2 === 0;
  return (
    <Card
      skeleton={!loaded}
      title={loaded ? 'Quarterly report' : undefined}
      description={loaded ? 'Updated 2 hours ago' : undefined}
      actions={<Button>Open</Button>}
      style={{ ...outlined, inlineSize: '17rem' }}
    />
  );
}
