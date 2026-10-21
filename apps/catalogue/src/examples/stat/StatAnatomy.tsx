import { Stat } from '@envsemble/envui';

export default function StatAnatomy() {
  return (
    <Stat.Group aria-label="Project health">
      <Stat.Root
        label="Lead time"
        value="2.5 days"
        trend={{ direction: 'down', label: '0.5 days faster', tone: 'success' }}
        description="Median"
      />
    </Stat.Group>
  );
}
