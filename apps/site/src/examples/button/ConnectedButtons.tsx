import { Button, ButtonGroup, Row, IconButton } from '@envsemble/envui';
import { IconCheck } from '@envsemble/envui/icons/Check';
import { IconClose } from '@envsemble/envui/icons/Close';
import { IconExpandMore } from '@envsemble/envui/icons/ExpandMore';
import { IconSettings } from '@envsemble/envui/icons/Settings';

export default function ConnectedButtons() {
  return (
    <Row wrap align="start" gap={6}>
      <ButtonGroup aria-label="Project actions">
        <Button>Open</Button>
        <Button>Edit</Button>
        <Button>Share</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Publish">
        <Button>Publish</Button>
        <IconButton variant="primary" icon={<IconExpandMore />} aria-label="More publish options" />
      </ButtonGroup>
      <ButtonGroup orientation="vertical" aria-label="Item actions">
        <Button variant="secondary">Open</Button>
        <Button variant="secondary">Edit</Button>
        <Button variant="secondary">Share</Button>
      </ButtonGroup>
      <ButtonGroup orientation="vertical" aria-label="Quick actions">
        <IconButton variant="secondary" icon={<IconSettings />} aria-label="Settings" />
        <IconButton variant="secondary" icon={<IconCheck />} aria-label="Confirm" />
        <IconButton variant="secondary" icon={<IconClose />} aria-label="Close" />
      </ButtonGroup>
    </Row>
  );
}
