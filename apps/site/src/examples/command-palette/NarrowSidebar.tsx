import { Button, Kbd, useModifierKey } from '@envsemble/envui';
import { IconSearch } from '@envsemble/envui/icons/Search';

export default function NarrowSidebar() {
  const modifier = useModifierKey();
  return (
    <Button
      variant="secondary"
      fullWidth
      startIcon={<IconSearch />}
      end={<Kbd keys={[modifier.label, 'K']} aria-hidden />}
      aria-keyshortcuts={`${modifier.key}+K`}
    >
      Search
    </Button>
  );
}
