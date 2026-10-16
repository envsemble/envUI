import { Stat } from '@envsemble/envui';

export default function TrendTones() {
  return (
    <Stat.Group aria-label="Reliability">
      {/* Fewer risks are good news, so the fall takes the success tone. */}
      <Stat.Root
        label="Open risks"
        value="3"
        trend={{ direction: 'down', label: '2 fewer than last week', tone: 'success' }}
      />
      {/* A higher error rate is bad news, so the rise takes the danger tone. */}
      <Stat.Root
        label="Error rate"
        value="0.4%"
        trend={{ direction: 'up', label: '+0.1 points', tone: 'danger' }}
      />
      <Stat.Root
        label="Monthly cost"
        value="€4,120"
        trend={{ direction: 'up', label: '+3% from last month', tone: 'warning' }}
        detail="Of a €4,500 budget"
      />
    </Stat.Group>
  );
}
