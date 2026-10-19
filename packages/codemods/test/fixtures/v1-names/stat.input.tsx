import { Stat, StatGroup } from '@envsemble/envui';
import type { StatGroupProps, StatProps, StatTrend, StatTrendTone } from '@envsemble/envui';

const trend: StatTrend = { value: 12, tone: 'positive' };
const tone: StatTrendTone = 'positive';

export function Overview({ group, stat }: { group?: StatGroupProps; stat?: StatProps }) {
  return (
    <StatGroup {...group}>
      <Stat {...stat} label="Members" value={48} trend={trend} />
      <Stat label="Projects" value={7} trend={{ value: 2, tone }} />
    </StatGroup>
  );
}
