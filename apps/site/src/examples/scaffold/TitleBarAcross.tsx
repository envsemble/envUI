import {
  Drawer,
  Page,
  PageHeader,
  Scaffold,
  Text,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { Folder } from '@envsemble/envui/icons/Folder';

const destinations: Destination[] = [
  { label: 'Documents', icon: <Description />, href: '/documents', current: true },
  { label: 'Shared', icon: <Folder />, href: '/shared' },
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
        drawer: <Drawer aria-label="Main, title bar across" destinations={destinations} />,
      }}
    >
      <Page header={<PageHeader title="Documents" headingLevel={3} />}>
        <Text emphasis="muted">Twelve documents.</Text>
      </Page>
    </Scaffold>
  );
}
