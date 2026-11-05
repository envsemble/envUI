import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Badge,
  Breadcrumbs,
  DocumentTabs,
  IconButton,
  NavigationBar,
  NavigationDrawer,
  NavigationRail,
  Pager,
  Pagination,
  TableOfContents,
  Tabs,
  Text,
  Tree,
  type Destination,
  type DocumentTabsItem,
  type NavigationDrawerDestination,
  type TreeItem,
} from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { IconArrowForward } from '@envsemble/envui/icons/ArrowForward';
import { IconDescription } from '@envsemble/envui/icons/Description';
import { IconEdit } from '@envsemble/envui/icons/Edit';
import { IconFolder } from '@envsemble/envui/icons/Folder';
import { IconFolderOpen } from '@envsemble/envui/icons/FolderOpen';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconInbox } from '@envsemble/envui/icons/Inbox';
import { IconLabel } from '@envsemble/envui/icons/Label';
import { IconSettings } from '@envsemble/envui/icons/Settings';
import { IconStar } from '@envsemble/envui/icons/Star';
import { Cell, Section, Strip, interactionStates } from './ContactSheetParts.js';

const sizes = ['sm', 'md', 'lg'] as const;
const densities = ['xs', 'sm', 'md', 'lg'] as const;

function Crumbs() {
  const items = [
    { label: 'Workspace', href: '#workspace' },
    { label: 'Plans', href: '#plans' },
    { label: 'Interview notes' },
  ];
  return (
    <Section name="Breadcrumbs">
      <Strip>
        {interactionStates.map(({ caption, force }) => (
          <Cell
            key={caption}
            caption={`${caption} (Plans)`}
            force={force}
            target="a[href='#plans']"
          >
            <Breadcrumbs items={items} />
          </Cell>
        ))}
        <Cell caption="Wrapping, narrow" width="12rem">
          <Breadcrumbs
            wrap
            items={[
              { label: 'Northwind workspace', href: '#a' },
              { label: 'Quarterly planning', href: '#b' },
              { label: 'Customer interview notes' },
            ]}
          />
        </Cell>
        <Cell caption="Truncating, narrow" width="12rem">
          <Breadcrumbs
            items={[
              { label: 'Northwind workspace', href: '#a' },
              { label: 'Quarterly planning', href: '#b' },
              { label: 'Customer interview notes' },
            ]}
          />
        </Cell>
      </Strip>
    </Section>
  );
}

const documents: DocumentTabsItem[] = [
  { value: 'roadmap.md', label: 'Roadmap.md', icon: <IconDescription /> },
  { value: 'budget.md', label: 'Budget.md', icon: <IconDescription /> },
  { value: 'notes.md', label: 'Notes.md (preview)', icon: <IconDescription />, preview: true },
];

function Documents({ value = 'roadmap.md' }: { value?: string }) {
  const [current, setCurrent] = useState<string | null>(value);
  return (
    <DocumentTabs
      aria-label="Open documents"
      items={documents}
      value={current}
      onValueChange={setCurrent}
      onClose={() => {}}
      end={<IconButton icon={<IconAdd />} aria-label="New document" variant="ghost" size="sm" />}
    />
  );
}

function DocumentTabStrip() {
  return (
    <Section name="DocumentTabs">
      <Strip>
        <Cell caption="Roadmap current, Notes a preview" width="34rem">
          <Documents />
        </Cell>
        {interactionStates.slice(1).map(({ caption, force }) => (
          <Cell
            key={caption}
            caption={`Budget: ${caption}`}
            force={force}
            target="[data-tab-id='budget.md']"
            width="34rem"
          >
            <Documents />
          </Cell>
        ))}
        <Cell
          caption="Current: focus-visible"
          force="focus"
          target="[role=tab][aria-selected=true]"
          width="34rem"
        >
          <Documents />
        </Cell>
      </Strip>
    </Section>
  );
}

const railDestinations: Destination[] = [
  { label: 'Home', icon: <IconHome />, href: '#home', current: true },
  { label: 'Inbox', icon: <IconInbox />, href: '#inbox', count: 4 },
  { label: 'Starred', icon: <IconStar />, href: '#starred' },
  { label: 'Settings', icon: <IconSettings />, href: '#settings' },
];

const drawerDestinations: NavigationDrawerDestination[] = [
  { label: 'Inbox', icon: <IconInbox />, href: '#inbox', count: 12, current: true },
  { label: 'Starred', icon: <IconStar />, href: '#starred' },
  {
    label: 'Projects',
    icon: <IconFolder />,
    href: '#projects',
    children: [
      { label: 'Website refresh', href: '#website' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  { label: 'Labels', icon: <IconLabel />, href: '#labels', group: 'Folders' },
  { label: 'Archive', icon: <IconFolder />, href: '#archive', group: 'Folders' },
];

function Navigation() {
  const frame = { blockSize: '19rem' };
  return (
    <>
      <Section name="NavigationDrawer">
        <Strip>
          <Cell caption="Default: count, nested, group, header" width="16rem">
            <div style={frame}>
              <NavigationDrawer
                aria-label="Mail"
                destinations={drawerDestinations}
                defaultExpanded={['#projects']}
                header={
                  <Text variant="title" render={<span />}>
                    Mail
                  </Text>
                }
              />
            </div>
          </Cell>
          {interactionStates.slice(1).map(({ caption, force }) => (
            <Cell
              key={caption}
              caption={`Starred: ${caption}`}
              force={force}
              target="a[href='#starred']"
              width="16rem"
            >
              <div style={frame}>
                <NavigationDrawer aria-label="Mail" destinations={drawerDestinations} />
              </div>
            </Cell>
          ))}
          <Cell caption="Page background" width="16rem">
            <div style={frame}>
              <NavigationDrawer
                aria-label="Mail"
                background="page"
                destinations={drawerDestinations}
              />
            </div>
          </Cell>
          <Cell caption="Resizable" width="16rem">
            <div style={frame}>
              <NavigationDrawer
                aria-label="Mail"
                resizable
                defaultWidth={15}
                destinations={drawerDestinations}
              />
            </div>
          </Cell>
          <Cell caption="Skeleton" width="16rem">
            <div style={frame}>
              <NavigationDrawer aria-label="Mail" skeleton destinations={drawerDestinations} />
            </div>
          </Cell>
        </Strip>
      </Section>
      <Section name="NavigationRail">
        <Strip>
          <Cell caption="Default, header and footer">
            <div style={frame}>
              <NavigationRail
                aria-label="Sections"
                destinations={railDestinations}
                header={
                  <IconButton variant="primary" icon={<IconEdit />} aria-label="New message" />
                }
              />
            </div>
          </Cell>
          {interactionStates.slice(1).map(({ caption, force }) => (
            <Cell
              key={caption}
              caption={`Inbox: ${caption}`}
              force={force}
              target="a[href='#inbox']"
            >
              <div style={frame}>
                <NavigationRail aria-label="Sections" destinations={railDestinations} />
              </div>
            </Cell>
          ))}
          <Cell caption="Page background">
            <div style={frame}>
              <NavigationRail
                aria-label="Sections"
                background="page"
                destinations={railDestinations}
              />
            </div>
          </Cell>
          <Cell caption="Skeleton">
            <div style={frame}>
              <NavigationRail aria-label="Sections" skeleton destinations={railDestinations} />
            </div>
          </Cell>
        </Strip>
      </Section>
      <Section name="NavigationBar">
        <Strip>
          <Cell caption="Default" width="24rem">
            <NavigationBar aria-label="Sections" destinations={railDestinations} />
          </Cell>
          {interactionStates.slice(1).map(({ caption, force }) => (
            <Cell
              key={caption}
              caption={`Inbox: ${caption}`}
              force={force}
              target="a[href='#inbox']"
              width="24rem"
            >
              <NavigationBar aria-label="Sections" destinations={railDestinations} />
            </Cell>
          ))}
          <Cell caption="Page background" width="24rem">
            <NavigationBar
              aria-label="Sections"
              background="page"
              destinations={railDestinations}
            />
          </Cell>
          <Cell caption="Skeleton" width="24rem">
            <NavigationBar aria-label="Sections" skeleton destinations={railDestinations} />
          </Cell>
        </Strip>
      </Section>
    </>
  );
}

function Pagers() {
  const pager = (
    <Pager.Root aria-label="Guide pages">
      <Pager.Previous href="#install" icon={<IconArrowBack />}>
        Install the app
      </Pager.Previous>
      <Pager.Next href="#invite" icon={<IconArrowForward />}>
        Invite your team
      </Pager.Next>
    </Pager.Root>
  );
  return (
    <Section name="Pager">
      <Strip>
        {interactionStates.map(({ caption, force }) => (
          <Cell
            key={caption}
            caption={`${caption} (Next)`}
            force={force}
            target="a[href='#invite']"
            width="30rem"
          >
            {pager}
          </Cell>
        ))}
        <Cell caption="Next only" width="30rem">
          <Pager.Root aria-label="Guide pages">
            <Pager.Next href="#invite" icon={<IconArrowForward />}>
              Invite your team
            </Pager.Next>
          </Pager.Root>
        </Cell>
      </Strip>
    </Section>
  );
}

function Paginations() {
  return (
    <Section name="Pagination">
      <Strip label="Variants">
        {(['secondary', 'outline', 'ghost', 'primary', 'text'] as const).map((variant) => (
          <Cell key={variant} caption={variant}>
            <Pagination
              page={3}
              pageSize={20}
              total={124}
              onPageChange={() => {}}
              variant={variant}
            />
          </Cell>
        ))}
      </Strip>
      <Strip label="Sizes, states">
        {sizes.map((size) => (
          <Cell key={size} caption={size}>
            <Pagination page={3} pageSize={20} total={124} onPageChange={() => {}} size={size} />
          </Cell>
        ))}
        <Cell caption="First page">
          <Pagination page={1} pageSize={20} total={124} onPageChange={() => {}} />
        </Cell>
        <Cell caption="Unknown total">
          <Pagination page={2} pageSize={20} hasNextPage onPageChange={() => {}} />
        </Cell>
        <Cell caption="Pending">
          <Pagination page={3} pageSize={20} total={124} pending onPageChange={() => {}} />
        </Cell>
        {interactionStates.slice(1).map(({ caption, force }) => (
          <Cell
            key={caption}
            caption={`Next: ${caption}`}
            force={force}
            target="button:last-of-type"
          >
            <Pagination page={3} pageSize={20} total={124} onPageChange={() => {}} />
          </Cell>
        ))}
      </Strip>
    </Section>
  );
}

function Contents() {
  const items = [
    {
      id: 'cs-setup',
      label: 'Setup',
      children: [
        { id: 'cs-install', label: 'Install' },
        { id: 'cs-configure', label: 'Configure' },
      ],
    },
    { id: 'cs-usage', label: 'Usage' },
    { id: 'cs-faq', label: 'Questions' },
  ];
  return (
    <Section name="TableOfContents">
      <Strip>
        <Cell caption="Current section first" width="11rem">
          <TableOfContents aria-label="Sections" items={items} />
        </Cell>
        {interactionStates.slice(1).map(({ caption, force }) => (
          <Cell
            key={caption}
            caption={`Usage: ${caption}`}
            force={force}
            target="a[href='#cs-usage']"
            width="11rem"
          >
            <TableOfContents aria-label="Sections" items={items} />
          </Cell>
        ))}
        <Cell caption="Its headings" width="14rem">
          <div>
            {items
              .flatMap((item) => [item, ...(item.children ?? [])])
              .map((item) => (
                <Text key={item.id} id={item.id} variant="body-sm">
                  {item.label}
                </Text>
              ))}
          </div>
        </Cell>
      </Strip>
    </Section>
  );
}

function TabStrips() {
  const items = (disabled = false) => [
    { value: 'summary', label: 'Summary', content: <Text>Plans and owners for the launch.</Text> },
    { value: 'files', label: 'Files', content: <Text>Twelve files.</Text> },
    { value: 'activity', label: 'Activity', content: <Text>Nothing yet.</Text>, disabled },
  ];
  return (
    <Section name="Tabs">
      <Strip label="States of Files">
        {interactionStates.map(({ caption, force }) => (
          <Cell key={caption} caption={caption} force={force} target="[role=tab]:nth-of-type(2)">
            <Tabs aria-label="Project views" items={items()} />
          </Cell>
        ))}
        <Cell
          caption="Selected: focus-visible"
          force="focus"
          target="[role=tab][aria-selected=true]"
        >
          <Tabs aria-label="Project views" items={items()} />
        </Cell>
        <Cell caption="Activity disabled">
          <Tabs aria-label="Project views" items={items(true)} />
        </Cell>
      </Strip>
      <Strip label="Sizes, forms">
        {sizes.map((size) => (
          <Cell key={size} caption={size}>
            <Tabs aria-label="Project views" size={size} items={items()} />
          </Cell>
        ))}
        <Cell caption="Fill" width="28rem">
          <Tabs aria-label="Project views" fill items={items()} />
        </Cell>
        <Cell caption="Vertical">
          <Tabs aria-label="Project views" orientation="vertical" items={items()} />
        </Cell>
        <Cell caption="Icons">
          <Tabs
            aria-label="Mailboxes"
            items={[
              { value: 'inbox', label: 'Inbox', icon: <IconInbox />, content: <Text>4 new.</Text> },
              {
                value: 'starred',
                label: 'Starred',
                icon: <IconStar />,
                content: <Text>None.</Text>,
              },
            ]}
          />
        </Cell>
      </Strip>
    </Section>
  );
}

const treeRows: TreeItem[] = [
  {
    value: 'design',
    depth: 0,
    label: 'Design',
    icon: <IconFolderOpen />,
    expandable: true,
    expanded: true,
    end: <Badge count={2} aria-label="2 unread" />,
  },
  {
    value: 'design/brand.md',
    depth: 1,
    label: 'Brand.md',
    icon: <IconDescription />,
    description: 'Draft',
  },
  { value: 'design/logo.md', depth: 1, label: 'Logo.md', icon: <IconDescription /> },
  {
    value: 'design/old.md',
    depth: 1,
    label: 'Old.md (disabled)',
    icon: <IconDescription />,
    disabled: true,
  },
  {
    value: 'research',
    depth: 0,
    label: 'Research',
    icon: <IconFolder />,
    expandable: true,
    expanded: false,
  },
];

/**
 * Moves a tree's cursor down one row by its own ↓ key, as a keyboard does, so the row the tree marks
 * as its cursor is the next one and the selection keeps none: the capture forces only the focus.
 */
function CursorDown({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current
      ?.querySelector('.env-tree')
      ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
  }, []);
  return <div ref={ref}>{children}</div>;
}

function Trees() {
  const tree = (density?: (typeof densities)[number]) => (
    <div style={{ blockSize: '11rem' }}>
      <Tree
        aria-label="Files"
        items={treeRows}
        value="design/brand.md"
        density={density}
        onAction={() => {}}
        onExpandedChange={() => {}}
      />
    </div>
  );
  return (
    <Section name="Tree">
      <Strip label="States">
        <Cell caption="Brand.md selected, Old.md disabled" width="16rem">
          {tree()}
        </Cell>
        <Cell
          caption="Logo.md: hover"
          force="hover"
          target="[role=treeitem]:nth-of-type(3)"
          width="16rem"
        >
          {tree()}
        </Cell>
        <Cell
          caption="Logo.md: focus-visible"
          force="focus"
          target=".env-tree"
          highlight=".env-tree"
          markAs="data-focus-visible"
          width="16rem"
        >
          <CursorDown>{tree()}</CursorDown>
        </Cell>
        <Cell
          caption="Logo.md: pressed"
          force="pressed"
          target="[role=treeitem]:nth-of-type(3)"
          width="16rem"
        >
          {tree()}
        </Cell>
      </Strip>
      <Strip label="Densities">
        {densities.map((density) => (
          <Cell key={density} caption={density} width="16rem">
            {tree(density)}
          </Cell>
        ))}
      </Strip>
    </Section>
  );
}

export function NavigationSheet() {
  return (
    <>
      <Crumbs />
      <DocumentTabStrip />
      <Navigation />
      <Pagers />
      <Paginations />
      <Contents />
      <TabStrips />
      <Trees />
    </>
  );
}
