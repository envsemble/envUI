import {
  IconButton,
  Page,
  PageHeader,
  NavigationRail,
  Scaffold,
  Text,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Search } from '@envsemble/envui/icons/Search';

const destinations: Destination[] = [
  { label: 'Home', icon: <Home />, href: '/home' },
  { label: 'Inbox', icon: <Inbox />, href: '/inbox', current: true },
];

export default function ScaffoldAnatomy() {
  return (
    // The rail at every width, so the figure keeps its parts on a narrow page.
    <Scaffold
      scroll="body"
      landmarks={false}
      style={{ blockSize: '16rem' }}
      navigationForms={{ compact: 'rail', medium: 'rail', expanded: 'rail', large: 'rail' }}
      topBar={
        <TopBar title="Northwind" actions={<IconButton icon={<Search />} aria-label="Search" />} />
      }
      navigation={{ rail: <NavigationRail destinations={destinations} /> }}
    >
      <Page header={<PageHeader title="Inbox" headingLevel={3} />}>
        <Text emphasis="muted">Three messages since yesterday.</Text>
      </Page>
    </Scaffold>
  );
}
