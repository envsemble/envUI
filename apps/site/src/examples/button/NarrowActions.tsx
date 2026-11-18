import { Button, IconButton, Row } from '@envsemble/envui';
import { IconMoreHoriz } from '@envsemble/envui/icons/MoreHoriz';
import { IconVisibility } from '@envsemble/envui/icons/Visibility';

export default function NarrowActions() {
  return (
    <Row wrap justify="end" align="center" gap={2}>
      <IconButton variant="secondary" icon={<IconVisibility />} aria-label="Preview" />
      <IconButton variant="secondary" icon={<IconMoreHoriz />} aria-label="More actions" />
      <Button>Save and publish the draft</Button>
    </Row>
  );
}
