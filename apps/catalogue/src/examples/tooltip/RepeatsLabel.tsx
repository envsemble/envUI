import { Button, Row, Tooltip } from '@envsemble/envui';
import { Download } from '@envsemble/envui/icons/Download';
import { Refresh } from '@envsemble/envui/icons/Refresh';

export default function RepeatsLabel() {
  // Shown open in the docs; without defaultOpen, the first tooltip opens on hover and focus.
  return (
    <Row wrap gap={2}>
      {/* Wrong: the tooltips say what the labels already say. */}
      <Tooltip content="Refresh" defaultOpen>
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
