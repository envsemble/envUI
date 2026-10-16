import { useState } from 'react';
import { RelativeTime, Stack, Text } from '@envsemble/envui';

export default function Languages() {
  const [updatedAt] = useState(() => Date.now() - 3 * 60 * 60_000);
  return (
    <Stack gap={2}>
      <Text lang="de">
        Aktualisiert <RelativeTime value={updatedAt} locale="de" />
      </Text>
      <Text lang="fr">
        Mis à jour <RelativeTime value={updatedAt} locale="fr" />
      </Text>
      <Text lang="es">
        Actualizado <RelativeTime value={updatedAt} locale="es" />
      </Text>
    </Stack>
  );
}
