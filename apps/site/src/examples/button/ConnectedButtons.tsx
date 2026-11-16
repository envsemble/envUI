import { Button, ButtonGroup, Row, IconButton } from '@envsemble/envui';
import { IconExpandMore } from '@envsemble/envui/icons/ExpandMore';

export default function ConnectedButtons() {
  return (
    <Row wrap align="start" gap={6}>
      <ButtonGroup aria-label="Project actions">
        <Button variant="secondary">Open</Button>
        <Button variant="secondary">Edit</Button>
        <Button variant="secondary">Share</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Publish">
        <Button>Publish</Button>
        <IconButton variant="primary" icon={<IconExpandMore />} aria-label="More publish options" />
      </ButtonGroup>
    </Row>
  );
}
