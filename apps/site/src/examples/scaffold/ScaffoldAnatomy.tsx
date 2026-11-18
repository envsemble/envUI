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
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconInbox } from '@envsemble/envui/icons/Inbox';
import { IconSearch } from '@envsemble/envui/icons/Search';

const destinations: Destination[] = [
  { label: 'Home', icon: <IconHome />, href: '/home' },
  { label: 'Inbox', icon: <IconInbox />, href: '/inbox', current: true },
];

export default function ScaffoldAnatomy() {
  return (
    <Scaffold
      scroll="body"
      landmarks={false}
      style={{ blockSize: '16rem' }}
      navigationForms={{ compact: 'rail', medium: 'rail', expanded: 'rail', large: 'rail' }}
      topBar={
        <TopBar title="Northwind" end={<IconButton icon={<IconSearch />} aria-label="Search" />} />
      }
      navigation={{ rail: <NavigationRail destinations={destinations} /> }}
    >
      <Page header={<PageHeader title="Inbox" headingLevel={3} />}>
        <Text emphasis="muted">Three messages since yesterday.</Text>
      </Page>
    </Scaffold>
  );
}
