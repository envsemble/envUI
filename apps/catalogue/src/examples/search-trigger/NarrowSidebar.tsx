import { Button, Kbd } from '@envsemble/envui';
import { Search } from '@envsemble/envui/icons/Search';

/** ⌘ on Apple platforms, Ctrl elsewhere. */
const apple = typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform);

export default function NarrowSidebar() {
  return (
    <Button
      variant="secondary"
      fullWidth
      startIcon={<Search />}
      end={<Kbd keys={[apple ? '⌘' : 'Ctrl', 'K']} aria-hidden />}
      aria-keyshortcuts={apple ? 'Meta+K' : 'Control+K'}
    >
      Search
    </Button>
  );
}
