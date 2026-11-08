import { useState } from 'react';
import { Accordion, Button, Column, Theme } from '@envsemble/envui';

export const mount = 'standalone';

/** Single, multiple, controlled and skeleton accordions, mounted with ?fixture=accordion. */
export default function AccordionFixture() {
  const [open, setOpen] = useState<string[]>([]);
  const [changes, setChanges] = useState<string[]>([]);
  return (
    <Column gap={6} className="fixture-section" data-testid="accordions">
      <Accordion.Root data-testid="single" defaultValue={['b']} style={{ inlineSize: '30rem' }}>
        <Accordion.Item value="a" title="First question">
          First answer
        </Accordion.Item>
        <Accordion.Item value="b" title="Second question">
          Second answer
        </Accordion.Item>
        <Accordion.Item value="c" title="Unavailable question" disabled>
          Unavailable answer
        </Accordion.Item>
      </Accordion.Root>
      <Accordion.Root data-testid="multiple" multiple headingLevel={2}>
        <Accordion.Item value="x" title="Notifications">
          Notification settings
        </Accordion.Item>
        <Accordion.Item value="y" title="Privacy">
          Privacy settings
        </Accordion.Item>
      </Accordion.Root>
      <Button onClick={() => setOpen(['billing'])}>Open billing</Button>
      <Accordion.Root
        data-testid="controlled"
        value={open}
        onValueChange={(next) => {
          setOpen(next);
          setChanges((current) => [...current, next.join(',') || 'none']);
        }}
      >
        <Accordion.Item value="account" title="Account">
          Account help
        </Accordion.Item>
        <Accordion.Item value="billing" title="Billing">
          Billing help
        </Accordion.Item>
      </Accordion.Root>
      <output data-testid="accordion-changes">{changes.join(' ')}</output>
      <Accordion.Root data-testid="skeleton" skeleton>
        <Accordion.Item title={undefined} />
        <Accordion.Item title="Loaded title" />
      </Accordion.Root>
      <Theme theme="dark" data-testid="dark">
        <Accordion.Root defaultValue={['d']}>
          <Accordion.Item value="d" title="Dark question">
            Dark answer
          </Accordion.Item>
        </Accordion.Root>
      </Theme>
    </Column>
  );
}
