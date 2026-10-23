import { IconButton, Tooltip } from '@envsemble/envui';
import { Refresh } from '@envsemble/envui/icons/Refresh';

export default function ShortName() {
  // Shown open in the docs; without defaultOpen, it opens on hover and focus.
  return (
    <Tooltip content="Refresh members" defaultOpen>
      <IconButton icon={<Refresh />} aria-label="Refresh members" />
    </Tooltip>
  );
}
