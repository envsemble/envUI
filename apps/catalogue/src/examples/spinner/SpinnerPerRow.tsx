import { Card, List, Spinner } from '@envsemble/envui';

const files = ['budget.xlsx', 'brief.docx', 'logo.svg'];

export default function SpinnerPerRow() {
  return (
    <Card title="Shared files" style={{ inlineSize: 'min(100%, 20rem)' }}>
      <List.Root aria-label="Shared files" aria-busy="true">
        {files.map((file) => (
          // Wrong: one update of the list, shown as many.
          <List.Item key={file} label={file} action={<Spinner size="sm" />} />
        ))}
      </List.Root>
    </Card>
  );
}
