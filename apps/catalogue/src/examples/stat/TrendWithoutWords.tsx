import { Stat } from '@envsemble/envui';

export default function TrendWithoutWords() {
  return (
    <Stat.Root label="Active projects" value="128" trend={{ direction: 'up', label: '12%' }} />
  );
}
