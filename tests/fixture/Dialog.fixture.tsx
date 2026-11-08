import { useRef, useState } from 'react';
import { Theme, Dialog, Button, TextField, Select, Sheet, Text } from '@envsemble/envui';
import { dialogOptions } from './SelectOptions.fixture.js';

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
        <Select label="Dialog choice" items={dialogOptions} defaultValue="aurora" />
      </Dialog>
      <output data-testid="dialog-status">{open ? 'open' : 'closed'}</output>
    </Theme>
  );
}

export function DialogVariantsFixture() {
  return (
    <Theme theme="light" className="fixture-section">
      <div className="fixture-actions">
        <Dialog
          title="Wide details"
          width="lg"
          trigger={<Button variant="secondary">Open wide dialog</Button>}
        >
          <Text>Content-heavy dialogs use the wide size.</Text>
        </Dialog>
        <Dialog
          title="Search plans"
          placement="top"
          trigger={<Button variant="secondary">Open top dialog</Button>}
        >
          <TextField label="Search" name="search" />
        </Dialog>
        <Sheet
          side="end"
          title="Report details"
          trigger={<Button variant="secondary">Open panel</Button>}
        >
          <Text>A panel at the right edge.</Text>
        </Sheet>
        <Sheet
          side="end"
          title="Wide report details"
          width="lg"
          trigger={<Button variant="secondary">Open wide panel</Button>}
        >
          <Text>A wide panel for content-heavy details.</Text>
        </Sheet>
      </div>
    </Theme>
  );
}
