import { Card, Column, Progress, Text } from '@envsemble/envui';
import { MotionStage } from '../../previews/MotionStage';
import { useBatch } from './Batch';

function Uploading() {
  const { done, round, style } = useBatch();
  return (
    <Card title="Uploading 3 files" style={{ inlineSize: 'min(100%, 20rem)' }}>
      <Column gap={3}>
        <Progress
          key={round}
          label="Uploading"
          value={done}
          max={3}
          valueText={`${Math.floor(done)} of 3 files`}
          style={style}
        />
        <Text variant="body-sm" emphasis="muted">
          budget.xlsx, brief.docx, logo.svg
        </Text>
      </Column>
    </Card>
  );
}

/** One bar for the batch, climbing steadily, in step with the don't beside it. */
export default function OneBarForBatchMotion() {
  return (
    <MotionStage label="one bar climbing for the batch">
      <Uploading />
    </MotionStage>
  );
}
