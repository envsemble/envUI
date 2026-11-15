import { Button, Card, Text } from '@envsemble/envui';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import { useTimeline } from '../../motion/Timeline';
import { MotionStage } from '../../figures/MotionStage';

const skeletonSteps = [360, 540];
const steps = [...skeletonSteps, 1800];

function Loading() {
  const loading = useTimeline(steps) < skeletonSteps.length;
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

export default function SkeletonFirst() {
  return (
    <SpecimenFrame size="content">
      <MotionStage label="the card filling in as its content loads">
        <Loading />
      </MotionStage>
    </SpecimenFrame>
  );
}
