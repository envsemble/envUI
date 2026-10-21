import { Button, ButtonGroup, Column } from '@envsemble/envui';
import { Check } from '@envsemble/envui/icons/Check';
import { Close } from '@envsemble/envui/icons/Close';
import { Settings } from '@envsemble/envui/icons/Settings';

export default function ConnectedButtons() {
  return (
    <Column gap={4} align="start">
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
        <Button variant="secondary" iconOnly icon={<Settings />} aria-label="Settings" />
        <Button variant="secondary" iconOnly icon={<Check />} aria-label="Confirm" />
        <Button variant="secondary" iconOnly icon={<Close />} aria-label="Close" />
      </ButtonGroup>
    </Column>
  );
}
