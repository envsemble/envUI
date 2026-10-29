import { Box, Button, Kbd, useModifierKey } from '@envsemble/envui';
import { IconSearch } from '@envsemble/envui/icons/Search';

export default function ButtonLabel() {
  const modifier = useModifierKey();
  return (
    <Box style={{ inlineSize: '16rem' }}>
      {/* A sidebar's width, which an application's frame sets. */}
      <Button
        variant="secondary"
        fullWidth
        startIcon={<IconSearch />}
        end={<Kbd keys={[modifier.label, 'K']} aria-hidden />}
        aria-keyshortcuts={`${modifier.key}+K`}
      >
        Search documents
      </Button>
    </Box>
  );
}
