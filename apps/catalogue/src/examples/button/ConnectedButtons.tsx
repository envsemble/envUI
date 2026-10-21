import { Button, ButtonGroup, Row, IconButton } from '@envsemble/envui';
import { Check } from '@envsemble/envui/icons/Check';
import { Close } from '@envsemble/envui/icons/Close';
import { Settings } from '@envsemble/envui/icons/Settings';

export default function ConnectedButtons() {
  return (
    <Row wrap align="start" gap={6}>
      <ButtonGroup aria-label="Project actions">
        <Button>Open</Button>
        <Button>Edit</Button>
        <Button>Share</Button>
      </ButtonGroup>
      <ButtonGroup orientation="vertical" aria-label="Item actions">
        <Button variant="secondary">Open</Button>
        <Button variant="secondary">Edit</Button>
        <Button variant="secondary">Share</Button>
      </ButtonGroup>
      <ButtonGroup orientation="vertical" aria-label="Quick actions">
        <IconButton variant="secondary" icon={<Settings />} aria-label="Settings" />
        <IconButton variant="secondary" icon={<Check />} aria-label="Confirm" />
        <IconButton variant="secondary" icon={<Close />} aria-label="Close" />
      </ButtonGroup>
    </Row>
  );
}
