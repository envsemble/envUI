import { IconButton, Tooltip } from '@envsemble/envui';
import { IconRefresh } from '@envsemble/envui/icons/Refresh';

export default function TooltipAnatomy() {
  return (
    <Tooltip content="Refresh members" defaultOpen>
      <IconButton icon={<IconRefresh />} aria-label="Refresh members" variant="secondary" />
    </Tooltip>
  );
}
