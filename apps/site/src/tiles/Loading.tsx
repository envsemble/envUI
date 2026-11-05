import { Button, Card } from '@envsemble/envui';
import { useTimeline } from '../motion/Motion';

/**
 * In the shape of what is coming: a card with its item at rest; as it plays, it loads again, its
 * title and its line given as undefined, so its skeleton draws a bar for each, their own pulse
 * playing, and the item arrives in the same place.
 */
export default function LoadingTile() {
  // The still, a moment of loading, then the item, a while to read it.
  const loaded = useTimeline([400, 1600, 4000]) !== 1;
  return (
    <Card
      skeleton={!loaded}
      title={loaded ? 'Quarterly report' : undefined}
      description={loaded ? 'Updated 2 hours ago' : undefined}
      actions={<Button>Open</Button>}
      style={{ inlineSize: '15rem' }}
    />
  );
}
