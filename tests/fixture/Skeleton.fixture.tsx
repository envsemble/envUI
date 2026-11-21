import { useState } from 'react';
import {
  Alert,
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
import { IconFolder } from '@envsemble/envui/icons/Folder';

export const mount = 'standalone';

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

const destinations = placeholders<{ label: string }>(3).map((destination) => ({
  label: destination.label ?? '',
  icon: <IconFolder />,
  href: `#${destination.id}`,
}));

function Reader() {
  return <span data-testid="reader">{useSkeleton() ? 'in a skeleton' : 'loaded'}</span>;
}

export default function SkeletonFixture() {
  const [loaded, setLoaded] = useState(false);
  const items = loaded ? projects : undefined;
  const list = items ?? placeholders<Project>(3);
  return (
    <Column gap={5} padding={5}>
      <Button variant="secondary" onClick={() => setLoaded((value) => !value)}>
        {loaded ? 'Unload' : 'Load'}
      </Button>

      <Surface skeleton={!items} data-testid="projects" background="muted" padding={4}>
        <Column gap={3}>
          <Text variant="title" render={<h2 />}>
            Projects
          </Text>
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
          <Text data-testid="inline-blocks">
            Press <Kbd data-testid="kbd">K</Kbd> to open 42 projects.
          </Text>
          <Text data-testid="multi-line" style={{ inlineSize: '12rem' }}>
            A paragraph long enough to wrap onto several lines in its narrow column.
          </Text>
          <Card skeleton data-testid="nested-card" title="Nested" />
          <List.Root skeleton aria-label="Nested owners" data-testid="nested-list">
            <List.Item label="Sam Lee" />
          </List.Root>
        </Column>
      </Surface>

      {[true, false].map((skeleton) => (
        <Grid key={String(skeleton)} columns={2} gap={4}>
          <Surface
            skeleton={skeleton}
            data-testid={`paragraphs-${skeleton ? 'skeleton' : 'loaded'}`}
            render={<Column gap={2} />}
          >
            <p>A raw paragraph.</p>
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

      <List.Root aria-label="Rows">
        <List.Item
          skeleton
          data-testid="row-skeleton"
          start={<Checkbox aria-label="Choose the row" />}
          label="Alex Morgan"
        />
      </List.Root>

      <Surface skeleton dir="rtl" data-testid="rtl" padding={4}>
        <Text variant="title" render={<h3 />} data-testid="rtl-title" />
      </Surface>

      {(['ltr', 'rtl'] as const).map((dir) => (
        <Surface
          key={dir}
          skeleton
          dir={dir}
          data-testid={`scrolling-${dir}`}
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

      <List.Root skeleton aria-label="Owners loading" data-testid="list-skeleton">
        {placeholders<Project>(2).map((project) => (
          <List.Item key={project.id} label={project.owner} />
        ))}
      </List.Root>

      <NavigationDrawer skeleton data-testid="drawer" destinations={destinations} />
      <NavigationRail skeleton data-testid="rail" destinations={destinations} />
      <NavigationBar skeleton data-testid="bar" destinations={destinations} />

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
