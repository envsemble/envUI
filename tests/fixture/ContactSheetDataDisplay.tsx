import {
  AnimatedNumber,
  Avatar,
  AvatarButton,
  AvatarGroup,
  Badge,
  Button,
  CalendarHeatmap,
  DescriptionList,
  DiffStat,
  Graphic,
  IconButton,
  Link,
  List,
  Meter,
  Rating,
  RelativeTime,
  Table,
  type CalendarHeatmapDay,
} from '@envsemble/envui';
import { IconCheck } from '@envsemble/envui/icons/Check';
import { IconDescription } from '@envsemble/envui/icons/Description';
import { IconMoreVert } from '@envsemble/envui/icons/MoreVert';
import { Cell, Section, Strip, interactionStates } from './ContactSheetParts.js';

const densities = ['xs', 'sm', 'md', 'lg'] as const;
const hues = [
  'powder',
  'seafoam',
  'sage',
  'butter',
  'blush',
  'periwinkle',
  'orchid',
  'oat',
] as const;
const people = ['Alex Morgan', 'Sam Lee', 'Priya Shah', 'Jordan Ellis', 'Kai Ito', 'Mia Chen'];
const photo =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#94a3b8"/>' +
      '<circle cx="32" cy="26" r="12" fill="#e2e8f0"/><path d="M10 64c2-14 12-22 22-22s20 8 22 22Z" fill="#e2e8f0"/></svg>',
  );
const logo =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
      '<rect width="64" height="64" rx="14" fill="#0d9488"/>' +
      '<circle cx="46" cy="18" r="8" fill="#fbbf24"/>' +
      '<path d="M6 58 26 30l12 16 8-10 12 22Z" fill="#fef3c7"/>' +
      '<path d="M18 58 36 38l18 20Z" fill="#f97316"/></svg>',
  );
const wide =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 64"><rect width="160" height="64" fill="#1d4ed8"/>' +
      '<circle cx="32" cy="32" r="18" fill="#fbbf24"/></svg>',
  );

function Numbers() {
  return (
    <Section name="AnimatedNumber">
      <Strip>
        <Cell caption="Integer">
          <AnimatedNumber value={1284} />
        </Cell>
        <Cell caption="Formatted">
          <AnimatedNumber value={0.732} formatValue={(value) => `${(value * 100).toFixed(1)}%`} />
        </Cell>
        <Cell caption="In a heading">
          <span style={{ fontSize: '2rem' }}>
            <AnimatedNumber
              value={48210}
              formatValue={(value) => `$${value.toLocaleString('en-US')}`}
            />
          </span>
        </Cell>
      </Strip>
    </Section>
  );
}

function Avatars() {
  return (
    <Section name="Avatar, AvatarButton, AvatarGroup">
      <Strip label="Sizes">
        {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <Cell key={size} caption={size}>
            <Avatar name="Alex Morgan" size={size} />
          </Cell>
        ))}
        <Cell caption="Picture">
          <Avatar name="Sam Lee" src={photo} size="lg" />
        </Cell>
        <Cell caption="Person fallback">
          <Avatar name="Sam Lee" fallback="person" size="lg" />
        </Cell>
        <Cell caption="Named">
          <Avatar name="Priya Shah" named />
        </Cell>
        <Cell caption="Selected">
          <Avatar name="Priya Shah" selected size="lg" />
        </Cell>
      </Strip>
      <Strip label="Hues">
        {hues.map((hue) => (
          <Cell key={hue} caption={hue}>
            <Avatar name="Jordan Ellis" hue={hue} size="lg" />
          </Cell>
        ))}
      </Strip>
      <Strip label="AvatarButton">
        {interactionStates.map(({ caption, force }) => (
          <Cell key={caption} caption={caption} force={force}>
            <AvatarButton name="Alex Morgan" />
          </Cell>
        ))}
        <Cell caption="Disabled">
          <AvatarButton name="Alex Morgan" disabled />
        </Cell>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Cell key={size} caption={size}>
            <AvatarButton name="Alex Morgan" size={size} />
          </Cell>
        ))}
      </Strip>
      <Strip label="AvatarGroup">
        {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <Cell key={size} caption={`${size}, max 4`}>
            <AvatarGroup size={size} max={4} people={people.map((name) => ({ name }))} />
          </Cell>
        ))}
        <Cell caption="Hover (spread)" force="hover" target=".env-avatar-group">
          <AvatarGroup max={4} people={people.map((name) => ({ name }))} />
        </Cell>
        <Cell caption="Links, one selected, total 20" force="focus" target="a">
          <AvatarGroup
            total={20}
            people={people
              .slice(0, 3)
              .map((name, index) => ({ name, href: `#${index}`, selected: index === 1 }))}
          />
        </Cell>
        <Cell caption="Aligned to the end" width="14rem">
          <AvatarGroup align="end" people={people.slice(0, 3).map((name) => ({ name }))} />
        </Cell>
      </Strip>
    </Section>
  );
}

const badgeTones = [
  'neutral',
  'primary',
  'accent',
  'success',
  'warning',
  'danger',
  'done',
] as const;

function Badges() {
  return (
    <Section name="Badge and DiffStat">
      {(['soft', 'solid', 'outline'] as const).map((variant) => (
        <Strip key={variant} label={variant}>
          {badgeTones.map((tone) => (
            <Cell key={tone} caption={tone}>
              <Badge tone={tone} variant={variant}>
                {tone}
              </Badge>
            </Cell>
          ))}
          <Cell caption="Icon">
            <Badge variant={variant} tone="success" icon={<IconCheck />}>
              Passed
            </Badge>
          </Cell>
          <Cell caption="Count">
            <Badge variant={variant} tone="danger" count={4} aria-label="4 unread" />
          </Cell>
          <Cell caption="Count 120">
            <Badge variant={variant} count={120} aria-label="120 items" />
          </Cell>
        </Strip>
      ))}
      <Strip label="DiffStat">
        <Cell caption="Both">
          <DiffStat additions={128} deletions={14} />
        </Cell>
        <Cell caption="Additions only">
          <DiffStat additions={40} deletions={0} />
        </Cell>
        <Cell caption="Deletions only">
          <DiffStat additions={0} deletions={9} />
        </Cell>
      </Strip>
    </Section>
  );
}

const heatmap: CalendarHeatmapDay[] = Array.from({ length: 140 }, (_, index) => ({
  date: new Date(Date.UTC(2026, 5, 1) + index * 86_400_000).toISOString().slice(0, 10),
  value: Math.round((Math.sin(index / 4) + 1) * 3 + (index % 7 === 3 ? 4 : 0)),
}));

function Heatmaps() {
  return (
    <Section name="CalendarHeatmap">
      <Strip>
        {(['primary', 'neutral', 'accent', 'success', 'warning', 'danger', 'done'] as const).map(
          (tone) => (
            <Cell key={tone} caption={`${tone}, 4 levels`}>
              <CalendarHeatmap
                aria-label={`Edits, ${tone}`}
                data={heatmap}
                levels={4}
                weekStart={1}
                tone={tone}
              />
            </Cell>
          ),
        )}
        <Cell
          caption="Day hovered"
          force="hover"
          target="[data-date='2026-08-05'], [role=gridcell]:nth-of-type(20)"
        >
          <CalendarHeatmap aria-label="Edits" data={heatmap} levels={4} weekStart={1} />
        </Cell>
      </Strip>
    </Section>
  );
}

function Descriptions() {
  const items = (
    <>
      <DescriptionList.Item label="Owner">Alex Morgan</DescriptionList.Item>
      <DescriptionList.Item label="Status">
        <Badge tone="success">Active</Badge>
      </DescriptionList.Item>
      <DescriptionList.Item label="Created">4 November 2026</DescriptionList.Item>
    </>
  );
  return (
    <Section name="DescriptionList">
      <Strip>
        {(['inline', 'stacked'] as const).flatMap((layout) =>
          (['sm', 'md'] as const).map((size) => (
            <Cell key={`${layout}-${size}`} caption={`${layout} ${size}`} width="18rem">
              <DescriptionList.Root layout={layout} size={size}>
                {items}
              </DescriptionList.Root>
            </Cell>
          )),
        )}
        <Cell caption="Controls" width="22rem">
          <DescriptionList.Root controls>
            <DescriptionList.Item label="Plan">
              <Button variant="outline" size="sm">
                Change
              </Button>
            </DescriptionList.Item>
            <DescriptionList.Item label="Seats">12</DescriptionList.Item>
          </DescriptionList.Root>
        </Cell>
      </Strip>
    </Section>
  );
}

function Graphics() {
  return (
    <Section name="Graphic">
      <Strip label="Sizes">
        {(['text', 'icon', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <Cell key={size} caption={size}>
            <Graphic src={logo} alt="Northwind" size={size} />
          </Cell>
        ))}
      </Strip>
      <Strip label="Fit, tint">
        <Cell caption="Fill, contain" width="10rem">
          <div style={{ blockSize: '5rem', inlineSize: '100%' }}>
            <Graphic src={wide} alt="Banner" size="fill" fit="contain" />
          </div>
        </Cell>
        <Cell caption="Fill, cover" width="10rem">
          <div style={{ blockSize: '5rem', inlineSize: '100%' }}>
            <Graphic src={wide} alt="Banner" size="fill" fit="cover" />
          </div>
        </Cell>
        <Cell caption="Aspect 16 / 9" width="10rem">
          <Graphic src={wide} alt="Banner" size="fill" aspect="16 / 9" fit="cover" />
        </Cell>
        <Cell caption="Own SVG, text tint">
          <span style={{ color: 'var(--env-color-fg-primary)' }}>
            <Graphic alt="" tint="text" size="md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M5 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm14 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm-7 12a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM8 5h8v2H8Zm3 2h2v8h-2Z" />
              </svg>
            </Graphic>
          </span>
        </Cell>
        <Cell caption="Own SVG, own colors">
          <Graphic alt="" tint="own" size="md">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#f97316" />
            </svg>
          </Graphic>
        </Cell>
      </Strip>
    </Section>
  );
}

function Lists() {
  const rows = (interactive: boolean) => (
    <>
      <List.Item
        start={<IconDescription />}
        label={
          interactive ? (
            <Link href="#launch" underline={false} data-row-target draggable={false}>
              Launch checklist
            </Link>
          ) : (
            'Launch checklist'
          )
        }
        description="Priya Shah"
        end={<Badge tone="primary">New</Badge>}
        interactive={interactive}
        current={interactive}
      />
      <List.Item
        start={<IconDescription />}
        label={
          interactive ? (
            <Link href="#budget" underline={false} data-row-target draggable={false}>
              Budget review
            </Link>
          ) : (
            'Budget review'
          )
        }
        description="Sam Lee"
        end={<IconButton variant="ghost" size="sm" icon={<IconMoreVert />} aria-label="More" />}
        interactive={interactive}
      />
      <List.Item
        start={<IconDescription />}
        label={
          interactive ? (
            <Link href="#notes" underline={false} data-row-target draggable={false}>
              Notes
            </Link>
          ) : (
            'Notes'
          )
        }
        interactive={interactive}
      />
    </>
  );
  return (
    <Section name="List">
      <Strip label="Interactive">
        <Cell caption="First current" width="20rem">
          <List.Root>{rows(true)}</List.Root>
        </Cell>
        <Cell caption="Budget: hover" force="hover" target="a[href='#budget']" width="20rem">
          <List.Root>{rows(true)}</List.Root>
        </Cell>
        <Cell
          caption="Budget: focus-visible"
          force="focus"
          target="a[href='#budget']"
          width="20rem"
        >
          <List.Root>{rows(true)}</List.Root>
        </Cell>
        <Cell caption="Budget: pressed" force="pressed" target="a[href='#budget']" width="20rem">
          <List.Root>{rows(true)}</List.Root>
        </Cell>
      </Strip>
      <Strip label="Densities">
        {densities.map((density) => (
          <Cell key={density} caption={`${density}, static`} width="18rem">
            <List.Root density={density}>{rows(false)}</List.Root>
          </Cell>
        ))}
        <Cell caption="Skeleton" width="18rem">
          <List.Root skeleton>{rows(false)}</List.Root>
        </Cell>
      </Strip>
    </Section>
  );
}

function Measures() {
  return (
    <Section name="Meter, Rating, RelativeTime">
      <Strip label="Meter">
        {[0, 35, 80, 100].map((value) => (
          <Cell key={value} caption={`${value}%`} width="12rem">
            <Meter label="Storage" value={value} />
          </Cell>
        ))}
        <Cell caption="Value text" width="12rem">
          <Meter label="Seats" value={9} max={12} valueText="9 of 12" />
        </Cell>
      </Strip>
      <Strip label="Rating">
        {[0, 2.5, 4, 5].map((value) => (
          <Cell key={value} caption={`${value} of 5`}>
            <Rating value={value} />
          </Cell>
        ))}
        <Cell caption="Value shown">
          <Rating value={4.3} showValue />
        </Cell>
        <Cell caption="Out of 10">
          <Rating value={7} max={10} />
        </Cell>
      </Strip>
      <Strip label="RelativeTime">
        {(['long', 'short', 'narrow'] as const).map((format) => (
          <Cell key={format} caption={format}>
            <RelativeTime
              value={Date.UTC(2026, 10, 4, 9)}
              now={Date.UTC(2026, 10, 4, 12)}
              format={format}
              locale="en"
            />
          </Cell>
        ))}
        <Cell caption="Now">
          <RelativeTime
            value={Date.UTC(2026, 10, 4, 12)}
            now={Date.UTC(2026, 10, 4, 12)}
            locale="en"
          />
        </Cell>
        <Cell caption="With tooltip, hovered" force="hover" target="time">
          <RelativeTime
            value={Date.UTC(2026, 9, 20)}
            now={Date.UTC(2026, 10, 4)}
            tooltip
            locale="en"
          />
        </Cell>
      </Strip>
    </Section>
  );
}

const projects = [
  { name: 'Website refresh', owner: 'Alex Morgan', status: 'Active', budget: 12400 },
  { name: 'Pricing', owner: 'Sam Lee', status: 'Paused', budget: 3100 },
  { name: 'Onboarding', owner: 'Priya Shah', status: 'Done', budget: 8650 },
];

function ProjectTable({
  density,
  skeleton,
  sticky,
}: {
  density?: (typeof densities)[number];
  skeleton?: boolean;
  sticky?: boolean;
}) {
  return (
    <Table.Root aria-label="Projects" density={density} skeleton={skeleton} stickyHeader={sticky}>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell sortDirection="ascending" onSortChange={() => {}}>
            Name
          </Table.HeaderCell>
          <Table.HeaderCell sortDirection="none" onSortChange={() => {}}>
            Owner
          </Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
          <Table.HeaderCell numeric>Budget</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {projects.map((project, index) => (
          <Table.Row key={project.name} interactive selected={index === 1}>
            <Table.Cell>
              <Link href={`#${index}`} underline={false}>
                {project.name}
              </Link>
            </Table.Cell>
            <Table.Cell>{project.owner}</Table.Cell>
            <Table.Cell>
              <Badge
                tone={
                  project.status === 'Active'
                    ? 'success'
                    : project.status === 'Done'
                      ? 'done'
                      : 'neutral'
                }
              >
                {project.status}
              </Badge>
            </Table.Cell>
            <Table.Cell numeric>${project.budget.toLocaleString('en-US')}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

function Tables() {
  return (
    <Section name="Table">
      <Strip label="States">
        <Cell caption="Sorted by name, Pricing selected" width="30rem">
          <ProjectTable />
        </Cell>
        <Cell
          caption="Onboarding row: hover"
          force="hover"
          target="tbody tr:nth-child(3) a"
          width="30rem"
        >
          <ProjectTable />
        </Cell>
        <Cell
          caption="Owner header: hover"
          force="hover"
          target="th:nth-child(2) button"
          width="30rem"
        >
          <ProjectTable />
        </Cell>
        <Cell
          caption="Name header: focus-visible"
          force="focus"
          target="th:nth-child(1) button"
          width="30rem"
        >
          <ProjectTable />
        </Cell>
        <Cell caption="Skeleton" width="30rem">
          <ProjectTable skeleton />
        </Cell>
      </Strip>
      <Strip label="Densities">
        {densities.map((density) => (
          <Cell key={density} caption={density} width="30rem">
            <ProjectTable density={density} />
          </Cell>
        ))}
      </Strip>
    </Section>
  );
}

export function DataDisplaySheet() {
  return (
    <>
      <Numbers />
      <Avatars />
      <Badges />
      <Heatmaps />
      <Descriptions />
      <Graphics />
      <Lists />
      <Measures />
      <Tables />
    </>
  );
}
