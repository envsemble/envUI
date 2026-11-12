import { Card, Column, Progress } from '@envsemble/envui';

const files = [
  { name: 'budget.xlsx', done: 100 },
  { name: 'brief.docx', done: 100 },
  { name: 'logo.svg', done: 30 },
];

export default function BarPerFile() {
  return (
    <Card title="Uploading 3 files" style={{ inlineSize: 'min(100%, 20rem)' }}>
      {/* Wrong: one upload, shown as three tasks. */}
      <Column gap={3}>
        {files.map((file) => (
          <Progress
            key={file.name}
            label={file.name}
            value={file.done}
            valueText={`${file.done}%`}
          />
        ))}
      </Column>
    </Card>
  );
}
