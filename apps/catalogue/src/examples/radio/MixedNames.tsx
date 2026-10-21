import { Radio, RadioGroup } from '@envsemble/envui';

export default function MixedNames() {
  return (
    <RadioGroup label="Access" defaultValue="team">
      <Radio value="team" label="Team members can open it" />
      <Radio value="private" label="Private" />
      <Radio value="link" label="Turn on link sharing" />
    </RadioGroup>
  );
}
