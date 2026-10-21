import { Button, Dialog, DialogClose } from '@envsemble/envui';

export default function ExtraCancelButton() {
  return (
    <Dialog
      // Shown open in the docs; without defaultOpen, it opens from its trigger.
      defaultOpen
      trigger={<Button variant="secondary">Archive project</Button>}
      title="Archive Northwind launch?"
      description="It leaves the project list. You can restore it from Archive."
      actions={
        <>
          {/* Wrong: a second way to close, beside the built-in Close. */}
          <DialogClose>Cancel</DialogClose>
          <Button>Archive project</Button>
        </>
      }
    />
  );
}
