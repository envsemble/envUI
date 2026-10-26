import { Button, Card } from '@envsemble/envui';
import { useTimeline } from '../previews/Motion';

/** In the shape of what is coming: a card loading, its content arriving, and loading again. */
const steps = [1300, 2600];

/** A card as a skeleton while it loads, then its content. */
export default function LoadingTile() {
  const loaded = useTimeline(steps) === 1;
  return (
    <Card
      skeleton={!loaded}
      title={loaded ? 'Northwind launch' : undefined}
      description={loaded ? 'Pricing and the press kit.' : undefined}
      actions={<Button>Open</Button>}
      style={{ inlineSize: '15rem' }}
    />
  );
}
