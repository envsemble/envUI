import { useState } from 'react';
import { Button, Disclosure, Stack } from '@envsemble/envui';

/** Controlled and uncontrolled disclosures, mounted with ?fixture=disclosures. */
export function DisclosuresFixture() {
  const [open, setOpen] = useState(false);
  const [changes, setChanges] = useState<boolean[]>([]);
  return (
    <Stack gap={4} className="fixture-section" data-testid="disclosures">
      <Disclosure
        title="Controlled"
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          setChanges((current) => [...current, next]);
        }}
      >
        <p>Controlled details</p>
      </Disclosure>
      <Button onClick={() => setOpen(true)}>Open from outside</Button>
      <output data-testid="disclosure-changes">{changes.join(' ')}</output>
      <Disclosure title="Open at first" defaultOpen>
        <p>Details shown at first</p>
      </Disclosure>
    </Stack>
  );
}
