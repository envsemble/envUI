import { Alert, Button, Column, IconButton, Row } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconDelete } from '@envsemble/envui/icons/Delete';
import { IconEdit } from '@envsemble/envui/icons/Edit';
import { IconMoreVert } from '@envsemble/envui/icons/MoreVert';

export default function FollowText() {
  return (
    <Column gap={4} align="center">
      <Row gap={2} wrap justify="center" align="center">
        <Button start={<IconAdd />}>New report</Button>
        <Button variant="secondary" start={<IconEdit />}>
          Rename
        </Button>
        <Button variant="ghost" tone="danger" start={<IconDelete />}>
          Delete
        </Button>
        <IconButton variant="ghost" icon={<IconMoreVert />} aria-label="More" />
      </Row>
      <Alert tone="success" title="The report is shared" />
    </Column>
  );
}
