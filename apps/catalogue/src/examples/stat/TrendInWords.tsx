import { Stat } from '@envsemble/envui';

export default function TrendInWords() {
  return (
    <Stat.Root
      label="Active projects"
      value="128"
      trend={{ direction: 'up', label: '+12% from last month' }}
    />
  );
}
