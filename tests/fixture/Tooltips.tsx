import { useState } from 'react';
import { Button, IconButton, Kbd, Link, Menu, Popover, Text, Tooltip } from '@envsemble/envui';
import { Archive } from '@envsemble/envui/icons/Archive';
import { ArrowForward } from '@envsemble/envui/icons/ArrowForward';
import { Delete } from '@envsemble/envui/icons/Delete';
import { FilterList } from '@envsemble/envui/icons/FilterList';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';
import { Pin } from '@envsemble/envui/icons/Pin';
import { Save } from '@envsemble/envui/icons/Save';

/**
 * Tooltips that describe a named control, repeat a name, wait on disabled controls, a toggle and a
 * checkbox among them, hold a Kbd, and name or describe the icon-only trigger of a menu and a
 * popover.
 */
export function TooltipsFixture() {
  const [seats, setSeats] = useState(false);
  const [pinned, setPinned] = useState(true);
  const [presses, setPresses] = useState(0);
  const [menuOpens, setMenuOpens] = useState(0);
  const [popoverOpens, setPopoverOpens] = useState(0);
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
        popupClassName="fixture-shortcut-tooltip"
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
      {/* The Tooltip is the menu's trigger and passes its props and ref on to the button. */}
      <section className="fixture-actions" data-testid="overlay-triggers">
        <Menu.Root
          aria-label="Row actions"
          onOpenChange={(open) => open && setMenuOpens((count) => count + 1)}
          trigger={
            <Tooltip content="More actions" delay={0}>
              <IconButton
                icon={<MoreVert />}
                aria-label="More actions"
                onClick={() => setPresses((count) => count + 1)}
              />
            </Tooltip>
          }
        >
          <Menu.Item>Rename</Menu.Item>
          <Menu.Item>Duplicate</Menu.Item>
        </Menu.Root>
        {/* Around a popover, the tooltip goes to its trigger, which has a name of its own. */}
        <Tooltip content="Show only some items" delay={0}>
          <Popover
            title="Filters"
            onOpenChange={(open) => open && setPopoverOpens((count) => count + 1)}
            trigger={<IconButton icon={<FilterList />} aria-label="Filters" />}
          >
            <Button variant="secondary">Only open items</Button>
          </Popover>
        </Tooltip>
        <Text data-testid="overlay-counts">
          {`${presses} presses, ${menuOpens} menu opens, ${popoverOpens} popover opens`}
        </Text>
      </section>
    </div>
  );
}
