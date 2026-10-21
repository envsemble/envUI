import { Stat } from '@envsemble/envui';

export default function BadNewsTone() {
  return (
    <Stat.Root
      label="Error rate"
      value="0.4%"
      trend={{ direction: 'up', label: '+0.1 points', tone: 'danger' }}
    />
  );
}
