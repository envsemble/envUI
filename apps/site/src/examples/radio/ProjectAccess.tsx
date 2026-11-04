import { useState } from 'react';
import { Radio, RadioGroup } from '@envsemble/envui';

export default function ProjectAccess() {
  const [access, setAccess] = useState('team');
  return (
    <RadioGroup label="Access" name="access" value={access} onValueChange={setAccess}>
      <Radio value="team" label="Team" />
      <Radio value="private" label="Only me" />
      <Radio value="link" label="Anyone with the link" />
    </RadioGroup>
  );
}
