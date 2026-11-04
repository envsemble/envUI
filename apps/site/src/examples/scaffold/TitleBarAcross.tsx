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

export default function TitleBarAcross() {
  return (
    // topBarSpan="full": the top bar runs across the whole width, above the drawer.
    <Scaffold
      scroll="body"
      landmarks={false}
      topBarSpan="full"
      navigationForms={{ compact: 'none', medium: 'drawer' }}
      style={{ blockSize: '16rem' }}
      topBar={<TopBar title="Northwind" />}
      navigation={{
        drawer: (
          <NavigationDrawer aria-label="Main, title bar across" destinations={destinations} />
        ),
      }}
    >
      <Page header={<PageHeader title="Documents" headingLevel={3} />}>
        <Text emphasis="muted">Twelve documents.</Text>
      </Page>
    </Scaffold>
  );
}
