import { Button, Row, Tooltip } from '@envsemble/envui';
import { Download } from '@envsemble/envui/icons/Download';
import { Refresh } from '@envsemble/envui/icons/Refresh';

export default function RepeatsLabel() {
  return (
    <Row wrap gap={2}>
      {/* Wrong: the tooltips say what the labels already say. */}
      <Tooltip content="Refresh">
        <Button variant="secondary" startIcon={<Refresh />}>
          Refresh
        </Button>
      </Tooltip>
      <Tooltip content="Download">
        <Button variant="secondary" startIcon={<Download />}>
          Download
        </Button>
      </Tooltip>
    </Row>
  );
}
