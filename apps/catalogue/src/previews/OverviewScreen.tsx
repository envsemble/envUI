import { useState } from 'react';
import {
  Avatar,
  AvatarButton,
  Badge,
  Bar,
  Button,
  Column,
  Drawer,
  Grid,
  IconButton,
  Link,
  Meter,
  Page,
  PageHeader,
  Rail,
  Scaffold,
  Surface,
  Table,
  Text,
  Tooltip,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Category } from '@envsemble/envui/icons/Category';
import { Description } from '@envsemble/envui/icons/Description';
import { Group } from '@envsemble/envui/icons/Group';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Search } from '@envsemble/envui/icons/Search';
import { Settings } from '@envsemble/envui/icons/Settings';

/*
 * The Overview's whole screen: an application framed as the App frame pattern frames one, a top
 * bar, the navigation as a bar, a rail or a drawer by its width, and a page of projects with key
 * figures and a table. It is live, so a reader can move between its places and resize the window.
 */

const places = [
  { label: 'Home', href: '/', icon: <Home /> },
  { label: 'Projects', href: '/projects', icon: <Category /> },
  { label: 'Inbox', href: '/inbox', icon: <Inbox />, count: 3 },
  { label: 'Documents', href: '/documents', icon: <Description /> },
  { label: 'Team', href: '/team', icon: <Group /> },
  { label: 'Settings', href: '/settings', icon: <Settings />, group: 'Workspace' },
];

const projects = [
  { name: 'Website refresh', owner: 'Priya Shah', status: 'In progress', tone: 'accent', done: 7 },
  { name: 'Onboarding emails', owner: 'Sam Lee', status: 'Blocked', tone: 'warning', done: 3 },
  { name: 'Billing migration', owner: 'Jordan Kim', status: 'Done', tone: 'done', done: 10 },
  { name: 'Mobile checkout', owner: 'Alex Morgan', status: 'In progress', tone: 'accent', done: 4 },
] as const;

const figures = [
  { label: 'Active projects', value: '12' },
  { label: 'Open tasks', value: '48' },
  { label: 'Done this week', value: '9' },
];

/** The page of projects: its header, three key figures and the projects' table. */
function ProjectsPage() {
  return (
    <Column gap={5}>
      <Grid columns={{ min: '9rem' }} gap={3}>
        {figures.map((figure) => (
          <Surface key={figure.label} padding={4} render={<Column gap={1} />}>
            <Text variant="body-sm" emphasis="muted">
              {figure.label}
            </Text>
            <Text variant="headline">{figure.value}</Text>
          </Surface>
        ))}
      </Grid>
      <Table.Root aria-label="Projects" narrowLayout="stack">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Project</Table.HeaderCell>
            <Table.HeaderCell>Owner</Table.HeaderCell>
            <Table.HeaderCell>Tasks done</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {projects.map((project) => (
            <Table.Row key={project.name}>
              <Table.Cell nowrap>
                <Link href={`/projects/${project.name}`} underline={false}>
                  {project.name}
                </Link>
              </Table.Cell>
              <Table.Cell label="Owner" nowrap>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Avatar name={project.owner} size="sm" />
                  {project.owner}
                </span>
              </Table.Cell>
              <Table.Cell label="Tasks done">
                <Meter value={project.done} max={10} label={`${project.done} of 10`} />
              </Table.Cell>
              <Table.Cell label="Status">
                <Badge tone={project.tone}>{project.status}</Badge>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Column>
  );
}

/** Any other place: a short empty state, as an application's page with nothing in it yet. */
function EmptyPlace({ label }: { label: string }) {
  return (
    <Column gap={3} align="center" padding={7}>
      <Text variant="title" render={<h4 />}>
        Nothing in {label} yet
      </Text>
      <Text variant="body-sm" emphasis="muted">
        Projects in Northwind show up here as your team works on them.
      </Text>
    </Column>
  );
}

/** The whole screen, live: choosing a place changes the page, as a router would. */
export function OverviewScreen() {
  const [current, setCurrent] = useState('/projects');
  const destinations: Destination[] = places.map((place) => ({
    ...place,
    current: place.href === current,
    onSelect: () => setCurrent(place.href),
  }));
  const place = places.find((entry) => entry.href === current) ?? places[1]!;
  const projectsShown = place.href === '/projects';
  return (
    <Scaffold
      scroll="body"
      landmarks={false}
      style={{ blockSize: '36rem' }}
      topBar={
        <TopBar
          title="Northwind"
          actions={
            <>
              <Tooltip content="Search" side="bottom">
                <IconButton variant="ghost" icon={<Search />} aria-label="Search" />
              </Tooltip>
              <AvatarButton name="Alex Morgan" description="alex.morgan@example.com" />
            </>
          }
        />
      }
      navigation={{
        bar: <Bar destinations={destinations} />,
        rail: <Rail destinations={destinations} />,
        drawer: <Drawer destinations={destinations} headingLevel={3} />,
      }}
    >
      <Page
        width="lg"
        header={
          <PageHeader
            title={place.label}
            headingLevel={3}
            description={projectsShown ? 'Everything your team is working on.' : undefined}
            actions={projectsShown && <Button startIcon={<Add />}>New project</Button>}
          />
        }
      >
        {projectsShown ? <ProjectsPage /> : <EmptyPlace label={place.label} />}
      </Page>
    </Scaffold>
  );
}
