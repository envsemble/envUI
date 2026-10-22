import { Counter, CounterBadge, Tree } from '@envsemble/envui';

export function Counts({ unread, tone }: { unread: number; tone: 'neutral' | 'accent' }) {
  return (
    <>
      <CounterBadge value={unread} aria-label={`${unread} unread`} />
      <CounterBadge value={2} tone="accent" />
      <CounterBadge value="99+" tone="neutral" className="inbox-count" />
      <Counter value={3} tone="accent" variant="soft" />
      <CounterBadge value={unread} tone={tone} />
      <Tree items={[]} aria-label="Folders" />
    </>
  );
}
