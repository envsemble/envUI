import {
  AvatarButton,
  IconButton,
  Page,
  PageHeader,
  NavigationRail,
  Scaffold,
  Text,
  Tooltip,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { IconCategory } from '@envsemble/envui/icons/Category';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconSearch } from '@envsemble/envui/icons/Search';

const destinations: Destination[] = [
  { label: 'Home', icon: <IconHome />, href: '/' },
  { label: 'Projects', icon: <IconCategory />, href: '/projects', current: true },
];

export default function AppFrameAnatomy() {
  return (
    // The rail at every width, so the figure keeps its parts on a narrow page.
    <Scaffold
      scroll="body"
      landmarks={false}
      style={{ blockSize: '18rem' }}
      navigationForms={{ compact: 'rail', medium: 'rail', expanded: 'rail', large: 'rail' }}
      topBar={
        <TopBar
          title="Northwind"
          actions={
            <>
              <Tooltip content="Search" side="bottom">
                <IconButton variant="ghost" icon={<IconSearch />} aria-label="Search" />
              </Tooltip>
              <AvatarButton name="Alex Morgan" />
            </>
          }
        />
      }
      navigation={{ rail: <NavigationRail destinations={destinations} /> }}
    >
      <Page header={<PageHeader title="Projects" headingLevel={3} />}>
        <Text emphasis="muted">Four projects are active.</Text>
      </Page>
    </Scaffold>
  );
}
