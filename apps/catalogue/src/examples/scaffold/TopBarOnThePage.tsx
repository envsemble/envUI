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

export default function TopBarOnThePage() {
  return (
    // The drawer keeps its background; background="none" leaves the top bar on the page.
    <Scaffold
      scroll="body"
      landmarks={false}
      forms={{ compact: 'drawer', medium: 'drawer' }}
      style={{ blockSize: '16rem' }}
      topBar={<TopBar title="Northwind" background="none" />}
      navigation={{ drawer: <Drawer destinations={destinations} /> }}
    >
      <Page header={<PageHeader title="Documents" headingLevel={3} />}>
        <Text emphasis="muted">Twelve documents.</Text>
      </Page>
    </Scaffold>
  );
}
