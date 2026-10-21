import { Button, Checkbox, Column, DialogClose, Sheet } from '@envsemble/envui';
import { FilterList } from '@envsemble/envui/icons/FilterList';

export default function VagueAction() {
  return (
    <Sheet
      // Shown open in the docs; without defaultOpen, it opens from its trigger.
      defaultOpen
      trigger={
        <Button variant="secondary" startIcon={<FilterList />}>
          Filters
        </Button>
      }
      title="Filters"
      closeLabel="Close filters"
      // Apply says nothing about what people will see.
      actions={<DialogClose variant="primary">Apply</DialogClose>}
    >
      <Column gap={3}>
        <Checkbox label="Active" defaultChecked />
        <Checkbox label="Paused" />
      </Column>
    </Sheet>
  );
}
