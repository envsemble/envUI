import {
  Button,
  Page,
  PageHeader,
  Rail,
  Scaffold,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { Category } from '@envsemble/envui/icons/Category';
import { Group } from '@envsemble/envui/icons/Group';
import { Home } from '@envsemble/envui/icons/Home';

const destinations: Destination[] = [
  { label: 'Home', icon: <Home />, href: '/' },
  { label: 'Projects', icon: <Category />, href: '/projects', current: true },
  { label: 'Team', icon: <Group />, href: '/team' },
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
        rail: <Rail aria-label="Main, destinations in the rail" destinations={destinations} />,
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
