import { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Column,
  Dialog,
  Grid,
  List,
  LoadingState,
  Menu,
  Message,
  Popover,
  Stat,
  Surface,
  Table,
  Text,
  placeholders,
  useSkeleton,
} from '@envsemble/envui';
import { installDevMode } from '@envsemble/envui/dev';

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
  const list = items ?? placeholders(3);
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
          <Stat.Group>
            <Stat.Root label="Projects" value={items?.length} data-testid="stat" />
          </Stat.Group>
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
        </Column>
      </Surface>

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

      <Card skeleton data-testid="card-skeleton" title="Title" description={undefined} />

      <Popover trigger={<Button>Open the popover</Button>} title="Details" skeleton>
        <Text>Loading details</Text>
      </Popover>
      <Menu.Root trigger={<Button>Open the menu</Button>} aria-label="Actions" skeleton>
        <Menu.Item>Rename</Menu.Item>
        <Menu.Item>Delete</Menu.Item>
      </Menu.Root>
      <Dialog trigger={<Button>Open the dialog</Button>} title="Project" skeleton>
        <Text>Loading the project</Text>
      </Dialog>
      <LoadingState label="Loading activity" data-testid="loading-state" />
    </Column>
  );
}
