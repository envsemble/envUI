import { Button, Card } from '@envsemble/envui';

/**
 * In the shape of what is coming: a card that stays loading, over a placeholder item, its title and
 * its line given as undefined, so its skeleton draws a bar for each, their own pulse playing.
 */
export default function LoadingTile() {
  return (
    <Card
      skeleton
      title={undefined}
      description={undefined}
      actions={<Button>Open</Button>}
      style={{ inlineSize: '15rem' }}
    />
  );
}
