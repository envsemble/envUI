import { useState } from 'react';
import { IconButton, Stack, TextField } from '@envsemble/envui';
import { Mail } from '@envsemble/envui/icons/Mail';
import { Visibility } from '@envsemble/envui/icons/Visibility';
import { VisibilityOff } from '@envsemble/envui/icons/VisibilityOff';

export default function IconAndAction() {
  const [visible, setVisible] = useState(false);
  return (
    // As wide as a form column.
    <Stack style={{ inlineSize: 'min(100%, 24rem)' }}>
      <TextField
        label="E-mail address"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue="alex.morgan@example.com"
        startIcon={<Mail />}
      />
      <TextField
        label="Password"
        name="password"
        type={visible ? 'text' : 'password'}
        autoComplete="current-password"
        endAction={
          <IconButton
            icon={visible ? <VisibilityOff /> : <Visibility />}
            aria-label="Show password"
            aria-pressed={visible}
            onClick={() => setVisible((shown) => !shown)}
          />
        }
      />
    </Stack>
  );
}
