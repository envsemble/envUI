import { Box, Button, Kbd } from '@envsemble/envui';
import { Search } from '@envsemble/envui/icons/Search';

/** ⌘ on Apple platforms, Ctrl elsewhere. */
const apple = typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform);

export default function EditorShortcut() {
  return (
    <Box style={{ inlineSize: '16rem' }}>
      {/* A sidebar's width, which an application's frame sets. */}
      <Button
        variant="secondary"
        fullWidth
        startIcon={<Search />}
        end={<Kbd keys={[apple ? '⌘' : 'Ctrl', 'B']} aria-hidden />}
        aria-keyshortcuts={apple ? 'Meta+B' : 'Control+B'}
      >
        Search
      </Button>
    </Box>
  );
}
