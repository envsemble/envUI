import { Button, Checkbox, Column, DialogClose, Sheet } from '@envsemble/envui';
import { FilterList } from '@envsemble/envui/icons/FilterList';

export default function ResultAsAction() {
  return (
    <Sheet
      trigger={
        <Button variant="secondary" startIcon={<FilterList />}>
          Filters
        </Button>
      }
      title="Filters"
      closeLabel="Close filters"
      // The primary action names its result.
      actions={<DialogClose variant="primary">Show 12 projects</DialogClose>}
    >
      <Column gap={3}>
        <Checkbox label="Active" defaultChecked />
        <Checkbox label="Paused" />
      </Column>
    </Sheet>
  );
}
