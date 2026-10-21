import { CounterBadge, Tree, Badge } from '@envsemble/envui';

export function Counts({ unread, tone }: { unread: number; tone: 'neutral' | 'accent' }) {
  return (
    <>
      <Badge count={unread} aria-label={`${unread} unread`} />
      <Badge variant="solid" count={2} tone="accent" />
      <Badge count="99+" tone="neutral" className="inbox-count" />
      <Badge count={3} tone="accent" variant="soft" />
      <CounterBadge value={unread} tone={tone} />
      <Tree items={[]} aria-label="Folders" />
    </>
  );
}
