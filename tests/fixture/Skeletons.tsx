import { useEffect, useState } from 'react';
import {
  Alert,
  AnimatedNumber,
  Avatar,
  Badge,
  NavigationBar,
  Button,
  Card,
  Checkbox,
  Column,
  Dialog,
  NavigationDrawer,
  Grid,
  Kbd,
  List,
  Menu,
  Message,
  Popover,
  NavigationRail,
  Row,
  Surface,
  Table,
  Text,
  TopBar,
  placeholders,
  useSkeleton,
  Spinner,
} from '@envsemble/envui';
import { installDevMode } from '@envsemble/envui/dev';
import { Folder } from '@envsemble/envui/icons/Folder';

interface Project {
  id: string;
  name: string;
  owner: string;
  summary: string;
  updated: string;
}

const projects: Project[] = [
  {
    id: 'brief',
    name: 'Launch brief',
    owner: 'Alex Morgan',
    summary: 'Maps and the services behind them.',
    updated: '2 hours ago',
  },
  {
    id: 'budget',
    name: 'Budget 2026',
    owner: 'Sam Lee',
    summary: 'The release pipeline.',
    updated: 'Yesterday',
  },
  {
    id: 'survey',
    name: 'Customer survey',
    owner: 'Priya Shah',
    summary: 'Research notes.',
    updated: 'Last week',
  },
];

/** Destinations over placeholder items: an empty label, and an icon of their kind. */
const destinations = placeholders<{ label: string }>(3).map((destination) => ({
  label: destination.label ?? '',
  icon: <Folder />,
  href: `#${destination.id}`,
}));

/** A component of the application's own that reads whether it is in a skeleton. */
function Reader() {
  return <span data-testid="reader">{useSkeleton() ? 'in a skeleton' : 'loaded'}</span>;
}

/**
 * Surfaces as skeletons, over placeholder items and over real content; a loaded copy of the same
 * surfaces for the shift check; popups that open as skeletons.
 */
export function SkeletonsFixture() {
  const [loaded, setLoaded] = useState(false);
  const items = loaded ? projects : undefined;
  const list = items ?? placeholders<Project>(3);
  useEffect(() => {
    const devMode = installDevMode({ parts: { schemaVersion: 1, components: {} } });
    return () => devMode.uninstall();
  }, []);
  return (
    <Column gap={5} padding={5}>
      <Button variant="secondary" onClick={() => setLoaded((value) => !value)}>
        {loaded ? 'Unload' : 'Load'}
      </Button>

      {/* Placeholder items in a surface that is a skeleton until they load. */}
      <Surface skeleton={!items} data-testid="projects" background="muted" padding={4}>
        <Column gap={3}>
          <Text variant="title" render={<h2 />}>
            Projects
          </Text>
          {/* Badges, a label and counts in each variant, are filled shapes in a skeleton. */}
          <Row gap={2}>
            <Badge data-testid="badge-skeleton">Draft</Badge>
            <Badge count={3} tone="primary" variant="solid" data-testid="count-solid-skeleton" />
            <Badge count={5} variant="outline" data-testid="count-outline-skeleton" />
          </Row>
          <Reader />
          <Grid columns="repeat(3, minmax(0, 1fr))" gap={3}>
            {list.map((project) => (
              <Card
                key={project.id}
                data-testid="project-card"
                title={project.name}
                meta={project.updated}
                description={project.summary}
                actions={<Button variant="secondary">Open</Button>}
              />
            ))}
          </Grid>
          <List.Root aria-label="Owners">
            {list.map((project) => (
              <List.Item
                key={project.id}
                data-testid="owner-row"
                start={<Avatar name={project.owner ?? ''} />}
                label={project.owner}
                description={project.updated}
              />
            ))}
          </List.Root>
          <Table.Root aria-label="Projects table">
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Owner</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {list.map((project) => (
                <Table.Row key={project.id}>
                  <Table.Cell data-testid="name-cell">{project.name}</Table.Cell>
                  <Table.Cell>{project.owner}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
          <div data-testid="raw">Raw text in a div</div>
          {/* Content laid out as a block of its own in the line draws its own bar. */}
          <Text data-testid="inline-blocks">
            Press <Kbd data-testid="kbd">K</Kbd> to open <AnimatedNumber value={42} /> projects.
          </Text>
          {/* Running text over several lines: a bar on each line. */}
          <Text data-testid="multi-line" style={{ inlineSize: '12rem' }}>
            A paragraph long enough to wrap onto several lines in its narrow column.
          </Text>
          {/* A skeleton inside a skeleton, and a list that holds no wrapper: neither is heard. */}
          <Card skeleton data-testid="nested-card" title="Nested" />
          <List.Root skeleton aria-label="Nested owners" data-testid="nested-list">
            <List.Item label="Sam Lee" />
          </List.Root>
        </Column>
      </Surface>

      {/* The same content as a skeleton and loaded, whose children take the same boxes: raw
          text elements in a column, and lists on a muted surface. */}
      {[true, false].map((skeleton) => (
        <Grid key={String(skeleton)} columns={2} gap={4}>
          <Surface
            skeleton={skeleton}
            data-testid={`paragraphs-${skeleton ? 'skeleton' : 'loaded'}`}
            render={<Column gap={2} />}
          >
            <p>A raw paragraph.</p>
            {/* Elements with margins of the browser's own, which the column takes away. */}
            <h3>A raw heading</h3>
            <blockquote>A raw quotation.</blockquote>
          </Surface>
          <Surface
            background="muted"
            padding={3}
            data-testid={`lists-${skeleton ? 'skeleton' : 'loaded'}`}
          >
            <List.Root skeleton={skeleton} aria-label="First list">
              <List.Item label="Sam Lee" />
            </List.Root>
            <List.Root skeleton={skeleton} aria-label="Second list">
              <List.Item label="Priya Shah" />
            </List.Root>
          </Surface>
        </Grid>
      ))}

      {/* A row as a skeleton on its own: its start slot is inert with the rest. */}
      <List.Root aria-label="Rows">
        <List.Item
          skeleton
          data-testid="row-skeleton"
          start={<Checkbox aria-label="Choose the row" />}
          label="Alex Morgan"
        />
      </List.Root>

      {/* Right to left: the bars start at the right. */}
      <Surface skeleton dir="rtl" data-testid="rtl" padding={4}>
        <Text variant="title" render={<h3 />} data-testid="rtl-title" />
      </Surface>

      {/* Skeleton roots that scroll, as a wide table's region or a tall dialog: the bars past the
          first screen are drawn too. */}
      {(['ltr', 'rtl'] as const).map((dir) => (
        <Surface
          key={dir}
          skeleton
          dir={dir}
          data-testid={`scrolling-${dir}`}
          // Not a tab stop, as a scroller would be: the skeletons above it are skipped by Tab.
          tabIndex={-1}
          padding={2}
          style={{ inlineSize: '10rem', blockSize: '4rem', overflow: 'auto' }}
        >
          <Text render={<p />} style={{ whiteSpace: 'nowrap' }}>
            A line of text much wider than the box that holds it
          </Text>
          {['First', 'Second', 'Third', 'Fourth', 'Fifth'].map((line) => (
            <Text key={line} render={<p />}>
              {line} line
            </Text>
          ))}
        </Surface>
      ))}

      {/* A list skeleton on its own: inert, with a visually hidden busy status beside it. */}
      <List.Root skeleton aria-label="Owners loading" data-testid="list-skeleton">
        {placeholders<Project>(2).map((project) => (
          <List.Item key={project.id} label={project.owner} />
        ))}
      </List.Root>

      {/* Navigation whose destinations are loading: bars and icon shapes. */}
      <NavigationDrawer skeleton data-testid="drawer" destinations={destinations} />
      <NavigationRail skeleton data-testid="rail" destinations={destinations} />
      <NavigationBar skeleton data-testid="bar" destinations={destinations} />

      {/* The same content loaded, which the shift check toggles. */}
      <Surface data-testid="loaded" background="muted" padding={4}>
        <Column gap={3}>
          <Text variant="title" render={<h2 />}>
            Loaded
          </Text>
          <Grid columns="repeat(3, minmax(0, 1fr))" gap={3}>
            {projects.map((project) => (
              <Card
                key={project.id}
                title={project.name}
                meta={project.updated}
                description={project.summary}
                actions={<Button variant="secondary">Open</Button>}
              />
            ))}
          </Grid>
          <Alert title="Heads up">Builds pause tonight.</Alert>
          <img alt="" width={64} height={48} />
          <Message from="other" author="Sam Lee" meta="09:12">
            The release notes are ready.
          </Message>
        </Column>
      </Surface>

      {/* A part that changes size in a skeleton, which the shift check reports. */}
      <Surface data-testid="shifting" padding={4}>
        <Text className="fixture-shifts">Grows in a skeleton</Text>
        {/* Media without an aspect ratio, which has no size until it loads. */}
        <img alt="" data-testid="no-ratio" />
      </Surface>
      <style>{`[data-env-skeleton] .fixture-shifts { padding-block: 1rem; }`}</style>

      <TopBar skeleton data-testid="top-bar" title={items?.length ? 'Projects' : undefined} />
      <Card skeleton data-testid="card-skeleton" title="Title" description={undefined} />

      <Popover trigger={<Button>Open the popover</Button>} title="Details" skeleton>
        Raw details in the popover
      </Popover>
      <Menu.Root trigger={<Button>Open the menu</Button>} aria-label="Actions" skeleton>
        <Menu.Item>Rename</Menu.Item>
        <Menu.Item>Delete</Menu.Item>
      </Menu.Root>
      <Dialog trigger={<Button>Open the dialog</Button>} title="Project" skeleton>
        <Text>Loading the project</Text>
      </Dialog>
      <Spinner label="Loading activity" showLabel data-testid="loading-state" />
    </Column>
  );
}
