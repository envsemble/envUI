import { useState, type CSSProperties } from 'react';
import {
  AvatarButton,
  NavigationBar,
  Button,
  Card,
  Column,
  NavigationDrawer,
  Grid,
  List,
  Page,
  PageHeader,
  NavigationRail,
  Scaffold,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { IconCategory } from '@envsemble/envui/icons/Category';
import { IconGroup } from '@envsemble/envui/icons/Group';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconSettings } from '@envsemble/envui/icons/Settings';

const windowStandIn: CSSProperties = { blockSize: '30rem' };

export function SmallApplication({ fixedColumns = false }: { fixedColumns?: boolean }) {
  const [current, setCurrent] = useState('/projects');
  const destinations: Destination[] = places.map((place) => ({
    ...place,
    current: place.href === current,
    onClick: () => setCurrent(place.href),
  }));
  return (
    <Scaffold
      scroll="body"
      landmarks={false}
      style={windowStandIn}
      topBar={<TopBar title="Northwind" end={<AvatarButton name="Alex Morgan" />} />}
      navigation={{
        bar: <NavigationBar destinations={destinations} />,
        rail: <NavigationRail destinations={destinations} />,
        drawer: <NavigationDrawer destinations={destinations} />,
      }}
    >
      <Page
        width="lg"
        header={
          <PageHeader title="Projects" headingLevel={3} actions={<Button>New project</Button>} />
        }
      >
        <Column gap={6}>
          <Grid name="projects" columns={fixedColumns ? 3 : { min: '14rem' }} gap={4}>
            {projects.map((project) => (
              <Card
                key={project.name}
                title={project.name}
                meta={project.owner}
                description={project.description}
              />
            ))}
          </Grid>
          <List.Root aria-label="Recent activity">
            {activity.map((item) => (
              <List.Item key={item.label} label={item.label} description={item.when} />
            ))}
          </List.Root>
        </Column>
      </Page>
    </Scaffold>
  );
}

const places = [
  { label: 'Home', href: '/', icon: <IconHome /> },
  { label: 'Projects', href: '/projects', icon: <IconCategory /> },
  { label: 'Team', href: '/team', icon: <IconGroup /> },
  { label: 'Settings', href: '/settings', icon: <IconSettings /> },
];

const projects = [
  { name: 'Website refresh', owner: 'Priya Shah', description: 'New pages for the spring launch.' },
  { name: 'Quarterly report', owner: 'Sam Lee', description: 'Figures for the last three months.' },
  {
    name: 'Onboarding guide',
    owner: 'Alex Morgan',
    description: 'The first week for new members.',
  },
];

const activity = [
  { label: 'Priya Shah published the launch pages', when: '2 hours ago' },
  { label: 'Sam Lee shared the quarterly figures', when: 'Yesterday' },
];
