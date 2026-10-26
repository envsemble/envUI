import { useState } from 'react';
import { Switch } from '@envsemble/envui';

export default function StateInLabel() {
  const [on, setOn] = useState(true);
  return (
    <Switch
      label={on ? 'E-mail notifications on' : 'E-mail notifications off'}
      checked={on}
      onCheckedChange={setOn}
    />
  );
}
