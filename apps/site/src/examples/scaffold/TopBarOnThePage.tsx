import {
  NavigationDrawer,
  Page,
  PageHeader,
  Scaffold,
  Text,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { IconDescription } from '@envsemble/envui/icons/Description';
import { IconFolder } from '@envsemble/envui/icons/Folder';

const destinations: Destination[] = [
  { label: 'Documents', icon: <IconDescription />, href: '/documents', current: true },
  { label: 'Shared', icon: <IconFolder />, href: '/shared' },
];

export default function TopBarOnThePage() {
  return (
    // The drawer keeps its background; background="page" puts the top bar on the page.
    <Scaffold
      scroll="body"
      landmarks={false}
      navigationForms={{ compact: 'none', medium: 'drawer' }}
      style={{ blockSize: '16rem' }}
      topBar={<TopBar title="Northwind" background="page" />}
      navigation={{
        drawer: (
          <NavigationDrawer aria-label="Main, top bar on the page" destinations={destinations} />
        ),
      }}
    >
      <Page header={<PageHeader title="Documents" headingLevel={3} />}>
        <Text emphasis="muted">Twelve documents.</Text>
      </Page>
    </Scaffold>
  );
}
