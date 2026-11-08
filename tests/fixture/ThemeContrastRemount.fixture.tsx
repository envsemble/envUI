import { useState } from 'react';
import { Button, ThemePreferenceProvider } from '@envsemble/envui';

export const mount = 'root';

const users = [
  { id: 'first', contrast: 'high' },
  { id: 'second', contrast: 'system' },
] as const;

/**
 * A provider keyed by the signed-in user, whose stored contrast it applies, so switching users
 * mounts a new provider.
 */
export default function ThemeContrastRemountFixture() {
  const [user, setUser] = useState<(typeof users)[number]>(users[0]);
  return (
    <ThemePreferenceProvider
      key={user.id}
      storageKey="fixture-remount-theme"
      contrast={user.contrast}
      className="fixture-main"
    >
      <Button onClick={() => setUser(users[1])}>Switch to the second user</Button>
    </ThemePreferenceProvider>
  );
}
