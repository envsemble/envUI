import { useState } from 'react';
import { IconButton, TextField } from '@envsemble/envui';
import { IconLock } from '@envsemble/envui/icons/Lock';
import { IconVisibility } from '@envsemble/envui/icons/Visibility';
import { IconVisibilityOff } from '@envsemble/envui/icons/VisibilityOff';

export default function IconAndEndAction() {
  const [shown, setShown] = useState(false);
  return (
    <TextField
      label="Password"
      name="password"
      type={shown ? 'text' : 'password'}
      autoComplete="current-password"
      defaultValue="northwind-2026"
      startIcon={<IconLock />}
      endAction={
        <IconButton
          icon={shown ? <IconVisibilityOff /> : <IconVisibility />}
          aria-label="Show password"
          aria-pressed={shown}
          onClick={() => setShown((value) => !value)}
        />
      }
      style={{ inlineSize: 'min(100%, 24rem)' }}
    />
  );
}
