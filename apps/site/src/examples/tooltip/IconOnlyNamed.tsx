import { IconButton, Row, Tooltip } from '@envsemble/envui';
import { IconDownload } from '@envsemble/envui/icons/Download';
import { IconRefresh } from '@envsemble/envui/icons/Refresh';

export default function IconOnlyNamed() {
  // Shown open in the docs; without defaultOpen, the first tooltip opens on hover and focus.
  return (
    <Row wrap gap={2}>
      <Tooltip content="Refresh" defaultOpen>
        <IconButton icon={<IconRefresh />} aria-label="Refresh" variant="secondary" />
      </Tooltip>
      <Tooltip content="Download">
        <IconButton icon={<IconDownload />} aria-label="Download" variant="secondary" />
      </Tooltip>
    </Row>
  );
}
