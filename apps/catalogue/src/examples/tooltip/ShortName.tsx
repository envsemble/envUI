import { IconButton, Tooltip } from '@envsemble/envui';
import { Refresh } from '@envsemble/envui/icons/Refresh';

export default function ShortName() {
  return (
    <Tooltip content="Refresh members">
      <IconButton icon={<Refresh />} aria-label="Refresh members" />
    </Tooltip>
  );
}
