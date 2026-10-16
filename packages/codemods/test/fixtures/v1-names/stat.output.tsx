import { Stat } from '@envsemble/envui';

const trend: Stat.Trend = { value: 12, tone: 'positive' };
const tone: Stat.TrendTone = 'positive';

export function Overview({ group, stat }: { group?: Stat.GroupProps; stat?: Stat.RootProps }) {
  return (
    <Stat.Group {...group}>
      <Stat.Root {...stat} label="Members" value={48} trend={trend} />
      <Stat.Root label="Projects" value={7} trend={{ value: 2, tone }} />
    </Stat.Group>
  );
}
