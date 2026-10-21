import { IconButton, Row, Tooltip } from '@envsemble/envui';
import { Download } from '@envsemble/envui/icons/Download';
import { Refresh } from '@envsemble/envui/icons/Refresh';

export default function IconOnlyNamed() {
  return (
    <Row wrap gap={2}>
      <Tooltip content="Refresh" defaultOpen>
        <IconButton icon={<Refresh />} aria-label="Refresh" variant="secondary" />
      </Tooltip>
      <Tooltip content="Download">
        <IconButton icon={<Download />} aria-label="Download" variant="secondary" />
      </Tooltip>
    </Row>
  );
}
