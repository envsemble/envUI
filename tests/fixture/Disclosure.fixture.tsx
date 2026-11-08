import { useState } from 'react';
import { Button, Disclosure, Column } from '@envsemble/envui';

/** Controlled and uncontrolled disclosures. */
export default function DisclosureFixture() {
  const [open, setOpen] = useState(false);
  const [changes, setChanges] = useState<boolean[]>([]);
  const [requests, setRequests] = useState<boolean[]>([]);
  return (
    <Column gap={4} className="fixture-section" data-testid="disclosures">
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
      <Disclosure
        title="Kept closed"
        open={false}
        onOpenChange={(next) => setRequests((current) => [...current, next])}
      >
        <p>Details kept closed</p>
      </Disclosure>
      <output data-testid="disclosure-requests">{requests.join(' ')}</output>
      <Disclosure title="Open at first" defaultOpen>
        <p>Details shown at first</p>
      </Disclosure>
    </Column>
  );
}
