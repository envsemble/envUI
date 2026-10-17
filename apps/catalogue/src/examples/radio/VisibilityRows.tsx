import { useState } from 'react';
import { Radio, RadioGroup } from '@envsemble/envui';

export default function VisibilityRows() {
  const [visibility, setVisibility] = useState('team');
  return (
    // As wide as a form column.
    <div style={{ inlineSize: 'min(100%, 28rem)' }}>
      <RadioGroup
        orientation="vertical"
        label="Visibility"
        name="visibility"
        value={visibility}
        onValueChange={setVisibility}
      >
        <Radio value="team" label="Team" description="Everyone at Northwind can open it." />
        <Radio value="private" label="Private" description="Only the people you invite." />
        <Radio
          value="public"
          label="Public"
          description="Your administrator has turned off public projects."
          disabled
        />
      </RadioGroup>
    </div>
  );
}
