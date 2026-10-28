import { Card, Column, Progress } from '@envsemble/envui';
import { MotionStage } from '../../motion/MotionStage';
import { useBatch } from './Batch';

const files = ['budget.xlsx', 'brief.docx', 'logo.svg'];

function Uploading() {
  const { shares, round, style } = useBatch();
  return (
    <Card title="Uploading 3 files" style={{ inlineSize: 'min(100%, 20rem)' }}>
      <Column gap={3} style={style}>
        {files.map((file, index) => (
          <Progress
            key={`${file} ${round}`}
            label={file}
            value={shares[index]!}
            valueText={`${shares[index]}%`}
          />
        ))}
      </Column>
    </Card>
  );
}

/** A bar for every file of the batch, filling unevenly, in step with the do beside it. */
export default function BarPerFileMotion() {
  return (
    <MotionStage label="a bar for every file filling unevenly">
      <Uploading />
    </MotionStage>
  );
}
