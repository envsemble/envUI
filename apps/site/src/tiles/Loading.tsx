import { Button, Card } from '@envsemble/envui';
import { useTimeline } from '../motion/Motion';

/**
 * In the shape of what is coming: a card loading, over a placeholder item, its title and its line
 * given as undefined, so its skeleton draws a bar for each, their own pulse playing; as it plays, the
 * item arrives and the card shows it in the same place, then loads again.
 */
export default function LoadingTile() {
  // The still, a moment more of loading, then the item, a while to read it.
  const loaded = useTimeline([1300, 1700, 4200]) === 2;
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
