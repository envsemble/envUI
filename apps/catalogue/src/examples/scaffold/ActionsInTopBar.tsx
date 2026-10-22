import { Bar, Button, Page, Scaffold, Text, TopBar, type Destination } from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Receipt } from '@envsemble/envui/icons/Receipt';

const destinations: Destination[] = [
  { label: 'Home', icon: <Home />, href: '/home' },
  { label: 'Inbox', icon: <Inbox />, href: '/inbox' },
  { label: 'Invoices', icon: <Receipt />, href: '/invoices', current: true },
];

export default function ActionsInTopBar() {
  return (
    // The page's title and action in the top bar: the page itself has no heading.
    <Scaffold
      scroll="body"
      landmarks={false}
      style={{ blockSize: '20rem', inlineSize: 'min(100%, 22rem)' }}
      topBar={<TopBar title="Invoices" actions={<Button size="sm">New invoice</Button>} />}
      navigation={{
        bar: <Bar aria-label="Main, actions in the top bar" destinations={destinations} />,
      }}
    >
      <Page>
        <Text emphasis="muted">Four invoices are due this month.</Text>
      </Page>
    </Scaffold>
  );
}
