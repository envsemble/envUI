import { IconButton, Tooltip } from '@envsemble/envui';
import { Refresh } from '@envsemble/envui/icons/Refresh';

export default function LongTooltip() {
  return (
    <Tooltip
      // Wrong: a paragraph people must hold the pointer still to read.
      content="Refreshes the list of members from the server. Members who joined in the last few minutes may take a while to appear, and removed members disappear."
    >
      <IconButton icon={<Refresh />} aria-label="Refresh members" />
    </Tooltip>
  );
}
