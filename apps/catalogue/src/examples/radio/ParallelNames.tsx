import { Radio, RadioGroup } from '@envsemble/envui';

export default function ParallelNames() {
  return (
    <RadioGroup label="Access" defaultValue="team">
      <Radio value="team" label="Team" />
      <Radio value="private" label="Only me" />
      <Radio value="link" label="Anyone with the link" />
    </RadioGroup>
  );
}
