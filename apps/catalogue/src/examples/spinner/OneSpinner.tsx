import { Card, List, Spinner } from '@envsemble/envui';

const files = ['budget.xlsx', 'brief.docx', 'logo.svg'];

export default function OneSpinner() {
  return (
    // One update of the whole list: one spinner beside its title.
    <Card
      title="Shared files"
      meta={<Spinner size="sm" label="Updating files" />}
      style={{ inlineSize: 'min(100%, 20rem)' }}
    >
      <List.Root aria-label="Shared files" aria-busy="true">
        {files.map((file) => (
          <List.Item key={file} label={file} />
        ))}
      </List.Root>
    </Card>
  );
}
