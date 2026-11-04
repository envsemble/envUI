import { useState } from 'react';
import { Accordion, Button, Column } from '@envsemble/envui';

export default function OpenFromOutside() {
  const [open, setOpen] = useState<string[]>([]);
  return (
    // value and onValueChange control which sections are open, such as from a button elsewhere.
    <Column gap={4} align="start" style={{ inlineSize: 'min(100%, 32rem)' }}>
      <Button variant="secondary" onClick={() => setOpen(['billing'])}>
        Show billing help
      </Button>
      <Accordion.Root value={open} onValueChange={setOpen} style={{ inlineSize: '100%' }}>
        <Accordion.Item value="account" title="Account">
          Change your name, email and password in Settings.
        </Accordion.Item>
        <Accordion.Item value="billing" title="Billing">
          Invoices are sent on the first of each month to the billing contact.
        </Accordion.Item>
      </Accordion.Root>
    </Column>
  );
}
