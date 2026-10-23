import { Box, Button, Kbd, useModifierKey } from '@envsemble/envui';
import { Search } from '@envsemble/envui/icons/Search';

export default function EditorShortcut() {
  const modifier = useModifierKey();
  return (
    <Box style={{ inlineSize: '16rem' }}>
      {/* A sidebar's width, which an application's frame sets. */}
      <Button
        variant="secondary"
        fullWidth
        startIcon={<Search />}
        end={<Kbd keys={[modifier.label, 'B']} aria-hidden />}
        aria-keyshortcuts={`${modifier.key}+B`}
      >
        Search
      </Button>
    </Box>
  );
}
