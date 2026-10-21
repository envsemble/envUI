import { Button, PageHeader } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';

export default function PageActions() {
  return (
    <PageHeader
      headingLevel={3}
      title="Projects"
      actions={
        <>
          <Button variant="secondary">Import</Button>
          <Button startIcon={<Add />}>New project</Button>
        </>
      }
    />
  );
}
