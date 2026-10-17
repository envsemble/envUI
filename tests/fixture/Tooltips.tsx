import { useState } from 'react';
import { Button, IconButton, Kbd, Link, Popover, Text, Tooltip } from '@envsemble/envui';
import { Archive } from '@envsemble/envui/icons/Archive';
import { ArrowForward } from '@envsemble/envui/icons/ArrowForward';
import { Delete } from '@envsemble/envui/icons/Delete';
import { Pin } from '@envsemble/envui/icons/Pin';
import { Save } from '@envsemble/envui/icons/Save';

/**
 * Tooltips that describe a named control, repeat a name, wait on disabled controls, a toggle and a
 * checkbox among them, and hold a Kbd.
 */
export function TooltipsFixture() {
  const [seats, setSeats] = useState(false);
  const [pinned, setPinned] = useState(true);
  return (
    <div className="fixture-actions fixture-section">
      <Tooltip content="Moves it out of the list" delay={0}>
        <IconButton icon={<Archive />} aria-label="Archive" />
      </Tooltip>
      <Tooltip content="Delete" delay={0}>
        <IconButton icon={<Delete />} aria-label="Delete" />
      </Tooltip>
      <Tooltip content="No seats left" delay={0}>
        <Button disabled={!seats}>Invite member</Button>
      </Tooltip>
      <Button variant="secondary" onClick={() => setSeats((current) => !current)}>
        Toggle seats
      </Button>
      {/* Named by mixed content, which the props alone don't give as text. */}
      <Tooltip content="Moves every item out of the list" delay={0}>
        <Button variant="secondary">
          Archive <Kbd>A</Kbd>
        </Button>
      </Tooltip>
      {/* A disabled link: its wrapper stands in as a link. */}
      <Tooltip content="Only owners open billing" delay={0}>
        <Link href="/billing" disabled>
          Billing
        </Link>
      </Tooltip>
      {/* A disabled toggle: its wrapper stands in as a button and keeps its pressed state. */}
      <Tooltip content="Only owners pin items" delay={0}>
        <IconButton icon={<Pin />} aria-label="Pin" aria-pressed={pinned} disabled />
      </Tooltip>
      <Button variant="secondary" onClick={() => setPinned((current) => !current)}>
        Toggle pinned
      </Button>
      {/* A disabled checkbox needs its checked state: no stand-in, the checkbox stays exposed. */}
      <Tooltip content="Owners are always notified" delay={0}>
        <input type="checkbox" aria-label="Notify owners" defaultChecked disabled />
      </Tooltip>
      <Tooltip
        delay={0}
        data-testid="shortcut-tooltip"
        content={
          <>
            Save <Kbd keys={['Ctrl', 'S']} />
          </>
        }
      >
        <IconButton icon={<Save />} aria-label="Save" />
      </Tooltip>
      {/* In right-to-left text, the end of the line is on the left. */}
      <div dir="rtl" className="fixture-actions">
        <Tooltip content="Next step" side="inline-end" delay={0}>
          <IconButton icon={<ArrowForward />} aria-label="Forward" />
        </Tooltip>
        <Popover
          side="inline-end"
          title="Step details"
          trigger={<Button variant="secondary">Details rtl</Button>}
        >
          <Text>The second of three steps.</Text>
        </Popover>
      </div>
    </div>
  );
}
