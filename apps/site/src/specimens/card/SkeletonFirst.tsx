import { Button, Card, Text } from '@envsemble/envui';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import { useTimeline } from '../../motion/Timeline';
import { MotionStage } from '../../figures/MotionStage';

/*
 * The card as its skeleton a moment, over two steps, as a timeline's first step is cut short as
 * it starts; then filled in, and a while to read it.
 */
const steps = [600, 900, 3000];

function Loading() {
  const loading = useTimeline(steps) < 2;
  // Over a placeholder item, the card's slots are given as undefined: each shows a bar.
  return (
    <Card
      skeleton={loading}
      title={loading ? undefined : 'Pricing research'}
      meta={loading ? undefined : 'Updated yesterday'}
      description={loading ? undefined : 'Interviews and survey results from twelve teams.'}
      actions={<Button>Open project</Button>}
      style={{ inlineSize: 'min(100%, 26rem)' }}
    >
      <Text variant="caption">Owned by Priya Shah · 4 open tasks</Text>
    </Card>
  );
}

/** A card as its own skeleton while its content loads, then filled in. */
export default function SkeletonFirst() {
  return (
    <SpecimenFrame size="content">
      <MotionStage label="the card filling in as its content loads">
        <Loading />
      </MotionStage>
    </SpecimenFrame>
  );
}
