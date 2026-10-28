import { Alert, Button, Column, IconButton, Row } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Delete } from '@envsemble/envui/icons/Delete';
import { Edit } from '@envsemble/envui/icons/Edit';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';

// Icons take the size and color of their label; one that stands alone gets a name of its own.
export default function FollowText() {
  return (
    <Column gap={4} align="center">
      <Row gap={2} wrap justify="center" align="center">
        <Button startIcon={<Add />}>New report</Button>
        <Button variant="secondary" startIcon={<Edit />}>
          Rename
        </Button>
        <Button variant="ghost" tone="danger" startIcon={<Delete />}>
          Delete
        </Button>
        <IconButton variant="ghost" icon={<MoreVert />} aria-label="More" />
      </Row>
      <Alert tone="success" title="The report is shared" />
    </Column>
  );
}
