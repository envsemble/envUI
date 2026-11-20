import { useState } from 'react';
import { Button, ThemePreferenceProvider } from '@envsemble/envui';

export const mount = 'root';

const users = [
  { id: 'first', contrast: 'high' },
  { id: 'second', contrast: 'system' },
] as const;

export default function ThemeContrastRemountFixture() {
  const [user, setUser] = useState<(typeof users)[number]>(users[0]);
  return (
    <ThemePreferenceProvider
      theme={{ contrast: user.contrast }}
      key={user.id}
      className="fixture-main"
    >
      <Button onClick={() => setUser(users[1])}>Switch to the second user</Button>
    </ThemePreferenceProvider>
  );
}
