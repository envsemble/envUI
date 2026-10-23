import { Button, Card } from '@envsemble/envui';

export default function SkeletonAnatomy() {
  // A card as a skeleton over a placeholder item: its title and description given as undefined.
  return (
    <Card
      skeleton
      title={undefined}
      meta="Updated"
      description={undefined}
      actions={<Button>Open project</Button>}
      style={{ inlineSize: 'min(100%, 26rem)' }}
    />
  );
}
