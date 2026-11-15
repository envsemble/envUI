import { Button, IconButton, TopBar } from '@envsemble/envui';
import { IconAccountCircle } from '@envsemble/envui/icons/AccountCircle';
import { IconMenu } from '@envsemble/envui/icons/Menu';
import { IconSearch } from '@envsemble/envui/icons/Search';

export default function TopBarFixture() {
  const start = <IconButton icon={<IconMenu />} aria-label="Open navigation" variant="ghost" />;
  const account = <IconButton icon={<IconAccountCircle />} aria-label="Account" variant="ghost" />;
  return (
    <div className="fixture-section" style={{ display: 'grid', gap: '1rem', inlineSize: '40rem' }}>
      <TopBar
        data-testid="centered"
        start={start}
        title="Northwind"
        center={<Button variant="secondary">Ask anything…</Button>}
        end={
          <>
            <IconButton icon={<IconSearch />} aria-label="Search" variant="ghost" />
            {account}
          </>
        }
      />
      <TopBar
        data-testid="long-title"
        start={start}
        title="The quarterly report of every team across the whole organization, with its appendices"
        end={account}
      />
      <TopBar
        data-testid="button-title"
        title={<Button variant="ghost">Website refresh</Button>}
        end={account}
      />
    </div>
  );
}
