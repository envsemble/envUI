import { Button, IconButton, Row } from '@envsemble/envui';
import { MoreHoriz } from '@envsemble/envui/icons/MoreHoriz';
import { Visibility } from '@envsemble/envui/icons/Visibility';

export default function NarrowActions() {
  return (
    // Where the row is narrow, the label wraps onto a second line; the icon buttons keep their size.
    <Row justify="end" align="center" gap={2}>
      <IconButton variant="secondary" icon={<Visibility />} aria-label="Preview" />
      <IconButton variant="secondary" icon={<MoreHoriz />} aria-label="More actions" />
      <Button>Save and publish the draft</Button>
    </Row>
  );
}
