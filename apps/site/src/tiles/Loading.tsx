import { Button, Card } from '@envsemble/envui';
import { useTimeline } from '../motion/Timeline';
import { outlined } from './Outline';

/**
 * In the shape of what is coming: a card with its item at rest; as it plays, it loads, its title
 * and its line given as undefined, so its skeleton draws a bar for each, their own pulse playing,
 * and the item arrives in the same place; a while to read it, and it loads again.
 */
export default function LoadingTile() {
  // The still, loading, the item, loading again, and the item a while longer, across the loop.
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
