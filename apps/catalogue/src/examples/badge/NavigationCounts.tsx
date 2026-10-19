import { CounterBadge, NavList } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Schedule } from '@envsemble/envui/icons/Schedule';

export default function NavigationCounts() {
  return (
    <nav aria-label="Workspace" style={{ inlineSize: 'min(100%, 16rem)' }}>
      <NavList.Root>
        <NavList.Item
          href="/inbox"
          icon={<Inbox />}
          selected
          end={<CounterBadge value={12} tone="accent" aria-label="12 unread" />}
        >
          Inbox
        </NavList.Item>
        <NavList.Item
          href="/plans"
          icon={<Description />}
          end={<CounterBadge value={4} aria-label="4 drafts" />}
        >
          Plans
        </NavList.Item>
        <NavList.Item
          href="/later"
          icon={<Schedule />}
          end={<CounterBadge value="99+" aria-label="More than 99 items" />}
        >
          Later
        </NavList.Item>
      </NavList.Root>
    </nav>
  );
}
