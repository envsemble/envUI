import { useState } from 'react';
import { Switch } from '@envsemble/envui';

export default function SameLabel() {
  const [on, setOn] = useState(true);
  return <Switch label="E-mail notifications" checked={on} onCheckedChange={setOn} />;
}
