import { useRef, useState } from 'react';
import { Theme, Dialog, Button, TextField, Select } from '@envsemble/envui';
import { dialogOptions } from './SelectOptions.js';

export function DialogFixture() {
  const [open, setOpen] = useState(false);
  const firstField = useRef<HTMLInputElement>(null);
  return (
    <Theme theme="dark" data-testid="nested-dark" className="fixture-section">
      <h2>Nested dark theme</h2>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Dark theme dialog"
        description="A nested theme retained in a portal."
        closeLabel="Cancel"
        initialFocus={firstField}
        trigger={<Button>Open dark dialog</Button>}
        actions={<Button onClick={() => setOpen(false)}>Save dialog</Button>}
      >
        <TextField ref={firstField} label="Dialog first field" defaultValue="Dialog value" />
        <Select
          variant="outlined"
          label="Dialog choice"
          options={dialogOptions}
          defaultValue="aurora"
        />
      </Dialog>
      <output data-testid="dialog-status">{open ? 'open' : 'closed'}</output>
    </Theme>
  );
}
