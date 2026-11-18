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

export default function NavigationApart() {
  return (
    <Scaffold
      scroll="body"
      landmarks={false}
      navigationForms={{ compact: 'none', medium: 'drawer' }}
      style={{ blockSize: '16rem' }}
      topBar={<TopBar title="Northwind" />}
      navigation={{
        drawer: (
          <NavigationDrawer
            aria-label="Main, set apart"
            background="default"
            destinations={destinations}
          />
        ),
      }}
    >
      <Page header={<PageHeader title="Documents" headingLevel={3} />}>
        <Text emphasis="muted">Twelve documents.</Text>
      </Page>
    </Scaffold>
  );
}
