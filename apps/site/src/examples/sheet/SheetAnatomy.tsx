import { Checkbox, Column, DialogClose, Sheet } from '@envsemble/envui';

export default function SheetAnatomy() {
  return (
    <Sheet
      defaultOpen
      title="Filters"
      description="Projects in Northwind."
      closeLabel="Close filters"
      actions={<DialogClose variant="primary">Show 12 projects</DialogClose>}
    >
      <Column gap={3}>
        <Checkbox label="Active" defaultChecked />
        <Checkbox label="Paused" />
      </Column>
    </Sheet>
  );
}
