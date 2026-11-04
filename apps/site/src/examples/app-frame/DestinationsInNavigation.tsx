import {
  Button,
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

const destinations: Destination[] = [
  { label: 'Home', icon: <IconHome />, href: '/' },
  { label: 'Projects', icon: <IconCategory />, href: '/projects', current: true },
  { label: 'Team', icon: <IconGroup />, href: '/team' },
];

export default function DestinationsInNavigation() {
  return (
    // The destinations in the navigation, the page's own action in its header.
    <Scaffold
      scroll="body"
      landmarks={false}
      style={{ blockSize: '16rem' }}
      navigationForms={{ compact: 'rail', medium: 'rail', expanded: 'rail', large: 'rail' }}
      topBar={<TopBar title="Northwind" />}
      navigation={{
        rail: (
          <NavigationRail aria-label="Main, destinations in the rail" destinations={destinations} />
        ),
      }}
    >
      <Page
        header={
          <PageHeader title="Projects" headingLevel={3} actions={<Button>New project</Button>} />
        }
      />
    </Scaffold>
  );
}
