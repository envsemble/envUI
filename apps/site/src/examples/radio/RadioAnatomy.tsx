import { Radio, RadioGroup } from '@envsemble/envui';

export default function RadioAnatomy() {
  return (
    <RadioGroup
      orientation="vertical"
      label="Visibility"
      defaultValue="team"
      style={{ inlineSize: 'min(100%, 22rem)' }}
    >
      <Radio value="team" label="Team" description="Everyone at Northwind can open it." />
      <Radio value="private" label="Private" description="Only the people you invite." />
    </RadioGroup>
  );
}
