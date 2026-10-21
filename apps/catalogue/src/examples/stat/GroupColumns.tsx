import { Stat } from '@envsemble/envui';

export default function GroupColumns() {
  return (
    <Stat.Group aria-label="Project health">
      <Stat.Root label="Active projects" value="128" />
      <Stat.Root label="Tasks done" value="1,284" />
      <Stat.Root label="Lead time" value="2.5 days" />
    </Stat.Group>
  );
}
