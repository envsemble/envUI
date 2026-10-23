import {
  AvatarButton,
  IconButton,
  Page,
  PageHeader,
  Rail,
  Scaffold,
  Text,
  Tooltip,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { Category } from '@envsemble/envui/icons/Category';
import { Home } from '@envsemble/envui/icons/Home';
import { Search } from '@envsemble/envui/icons/Search';

const destinations: Destination[] = [
  { label: 'Home', icon: <Home />, href: '/' },
  { label: 'Projects', icon: <Category />, href: '/projects', current: true },
];

export default function AppFrameAnatomy() {
  return (
    // The rail at every width, so the figure keeps its parts on a narrow page.
    <Scaffold
      scroll="body"
      landmarks={false}
      style={{ blockSize: '18rem' }}
      forms={{ compact: 'rail', medium: 'rail', expanded: 'rail', large: 'rail' }}
      topBar={
        <TopBar
          title="Northwind"
          actions={
            <>
              <Tooltip content="Search" side="bottom">
                <IconButton variant="ghost" icon={<Search />} aria-label="Search" />
              </Tooltip>
              <AvatarButton name="Alex Morgan" />
            </>
          }
        />
      }
      navigation={{ rail: <Rail destinations={destinations} /> }}
    >
      <Page header={<PageHeader title="Projects" headingLevel={3} />}>
        <Text emphasis="muted">Four projects are active.</Text>
      </Page>
    </Scaffold>
  );
}
