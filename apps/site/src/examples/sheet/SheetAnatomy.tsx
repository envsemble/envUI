import { Checkbox, Column, DialogClose, Sheet } from '@envsemble/envui';

export default function SheetAnatomy() {
  return (
    <Sheet
      // Shown open in the docs; give it a trigger instead of defaultOpen, as an application would.
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
