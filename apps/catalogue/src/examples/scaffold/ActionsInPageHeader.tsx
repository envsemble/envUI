import {
  Bar,
  Button,
  Page,
  PageHeader,
  Scaffold,
  Text,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Receipt } from '@envsemble/envui/icons/Receipt';

const destinations: Destination[] = [
  { label: 'Home', icon: <Home />, href: '/home' },
  { label: 'Inbox', icon: <Inbox />, href: '/inbox' },
  { label: 'Invoices', icon: <Receipt />, href: '/invoices', current: true },
];

export default function ActionsInPageHeader() {
  return (
    // The top bar names the application; the page's own title and action are in its header.
    <Scaffold
      scroll="body"
      landmarks={false}
      style={{ blockSize: '20rem', inlineSize: 'min(100%, 22rem)' }}
      topBar={<TopBar title="Northwind" />}
      navigation={{ bar: <Bar destinations={destinations} /> }}
    >
      <Page
        header={
          <PageHeader title="Invoices" headingLevel={3} actions={<Button>New invoice</Button>} />
        }
      >
        <Text emphasis="muted">Four invoices are due this month.</Text>
      </Page>
    </Scaffold>
  );
}
