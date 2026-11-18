import { useState, type ComponentPropsWithRef, type ReactElement } from 'react';
import {
  Button,
  HoverCard,
  IconButton,
  Kbd,
  Link,
  Menu,
  Popover,
  Text,
  Tooltip,
} from '@envsemble/envui';
import { IconArchive } from '@envsemble/envui/icons/Archive';
import { IconContentCopy } from '@envsemble/envui/icons/ContentCopy';
import { IconArrowForward } from '@envsemble/envui/icons/ArrowForward';
import { IconDelete } from '@envsemble/envui/icons/Delete';
import { IconFilterList } from '@envsemble/envui/icons/FilterList';
import { IconMoreVert } from '@envsemble/envui/icons/MoreVert';
import { IconPin } from '@envsemble/envui/icons/Pin';
import { IconSave } from '@envsemble/envui/icons/Save';

export const mount = 'standalone';

function BadgeButton({
  trigger,
  ...props
}: ComponentPropsWithRef<'button'> & { trigger: ReactElement }) {
  return (
    <button type="button" {...props}>
      {trigger}
    </button>
  );
}

function RefLessButton() {
  return <button type="button">Ref-less</button>;
}

export default function TooltipFixture() {
  const [seats, setSeats] = useState(false);
  const [pinned, setPinned] = useState(true);
  const [presses, setPresses] = useState(0);
  const [menuOpens, setMenuOpens] = useState(0);
  const [popoverOpens, setPopoverOpens] = useState(0);
  const [copied, setCopied] = useState(false);
  const [tour, setTour] = useState(false);
  const [tourReasons, setTourReasons] = useState<string[]>([]);
  return (
    <div className="fixture-actions fixture-section">
      <button type="button" onClick={() => setTour((current) => !current)}>
        Tour step
      </button>
      <Tooltip
        content="Filters live here"
        open={tour}
        onOpenChange={(next, { reason }) => {
          setTour(next);
          setTourReasons((current) => [...current, `${next ? 'open' : 'close'} ${reason}`]);
        }}
        side="bottom"
        align="start"
      >
        <IconButton icon={<IconFilterList />} aria-label="Filter tour" />
      </Tooltip>
      <output data-testid="tour-reasons">{tourReasons.join(', ')}</output>
      <Tooltip content="Moves it out of the list" delay={0}>
        <IconButton icon={<IconArchive />} aria-label="Archive" />
      </Tooltip>
      <Tooltip content="Delete" delay={0}>
        <IconButton icon={<IconDelete />} aria-label="Delete" />
      </Tooltip>
      <Tooltip content="No seats left" delay={0}>
        <Button disabled={!seats}>Invite member</Button>
      </Tooltip>
      <Button variant="secondary" onClick={() => setSeats((current) => !current)}>
        Toggle seats
      </Button>
      <Tooltip content="Moves every item out of the list" delay={0}>
        <Button variant="secondary">
          Archive <Kbd>A</Kbd>
        </Button>
      </Tooltip>
      <Tooltip content="Export" delay={0}>
        <Button variant="secondary">
          Export <span aria-hidden="true">↗</span>
        </Button>
      </Tooltip>
      <Tooltip content={copied ? 'Copied' : 'Copy link'} delay={0}>
        <IconButton
          icon={<IconContentCopy />}
          aria-label={copied ? 'Copied' : 'Copy link'}
          onKeyDown={(event) => {
            if (event.key === 'c') setCopied(true);
          }}
        />
      </Tooltip>
      <Tooltip content="Only owners open billing" delay={0}>
        <Link href="/billing" disabled>
          Billing
        </Link>
      </Tooltip>
      <Tooltip content="Only owners pin items" delay={0}>
        <IconButton icon={<IconPin />} aria-label="Pin" aria-pressed={pinned} disabled />
      </Tooltip>
      <Button variant="secondary" onClick={() => setPinned((current) => !current)}>
        Toggle pinned
      </Button>
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
        <IconButton icon={<IconSave />} aria-label="Save" />
      </Tooltip>
      <div dir="rtl" className="fixture-actions">
        <Tooltip content="Next step" side="inline-end" delay={0}>
          <IconButton icon={<IconArrowForward />} aria-label="Forward" />
        </Tooltip>
        <Popover
          side="inline-end"
          title="Step details"
          trigger={<Button variant="secondary">Details rtl</Button>}
        >
          <Text>The second of three steps.</Text>
        </Popover>
      </div>
      <Tooltip content="Nothing to archive" delay={0}>
        <Button variant="secondary" disabled>
          Archive all <Kbd>B</Kbd>
        </Button>
      </Tooltip>
      <span id="fixture-rename-label" hidden>
        Rename file
      </span>
      <Tooltip content="Gives the file a new name" delay={0}>
        <Button variant="secondary" aria-labelledby="fixture-rename-label">
          <IconArchive />
        </Button>
      </Tooltip>
      <section className="fixture-actions" data-testid="overlay-triggers">
        <Menu.Root
          aria-label="Row actions"
          onOpenChange={(open) => open && setMenuOpens((count) => count + 1)}
          trigger={
            <Tooltip content="More actions" delay={0}>
              <IconButton
                icon={<IconMoreVert />}
                aria-label="More actions"
                onClick={() => setPresses((count) => count + 1)}
              />
            </Tooltip>
          }
        >
          <Menu.Item>Rename</Menu.Item>
          <Menu.Item>Duplicate</Menu.Item>
        </Menu.Root>
        <Tooltip content="Show only some items" delay={0}>
          <Popover
            title="Filters"
            onOpenChange={(open) => open && setPopoverOpens((count) => count + 1)}
            trigger={<IconButton icon={<IconFilterList />} aria-label="Filters" />}
          >
            <Button variant="secondary">Only open items</Button>
          </Popover>
        </Tooltip>
        <Text data-testid="overlay-counts">
          {`${presses} presses, ${menuOpens} menu opens, ${popoverOpens} popover opens`}
        </Text>
      </section>
      <Tooltip content="Shows the badge" delay={0}>
        <BadgeButton trigger={<span>Badge</span>} aria-label="Badge button" />
      </Tooltip>
      <Text>
        Standup at 9:30{' '}
        <Tooltip content="Central European Time" delay={0}>
          <abbr tabIndex={0} data-testid="tooltip-text-trigger">
            CET
          </abbr>
        </Tooltip>
      </Text>
      {new URLSearchParams(window.location.search).has('warnings') && (
        <>
          <Tooltip content="Profile tooltip" delay={0}>
            <HoverCard delay={0} trigger={<Link href="#ada">Ada Lovelace</Link>}>
              <Text>Ada card</Text>
            </HoverCard>
          </Tooltip>
          <HoverCard
            delay={0}
            trigger={
              <Tooltip content="Profile tooltip" delay={0}>
                <Link href="#alan">Alan Turing</Link>
              </Tooltip>
            }
          >
            <Text>Alan card</Text>
          </HoverCard>
          {/* @ts-expect-error */}
          <Tooltip content="On text">Plain text</Tooltip>
          <Tooltip content="On a fragment">
            <>
              <button type="button">In a fragment</button>
            </>
          </Tooltip>
          <Tooltip content="On a ref-less control">
            <RefLessButton />
          </Tooltip>
        </>
      )}
    </div>
  );
}
