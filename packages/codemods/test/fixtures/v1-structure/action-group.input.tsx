import { ActionGroup, Button, IconButton } from '@envsemble/envui';

export function FormActions({ stacked, onCancel }) {
  return (
    <>
      <ActionGroup align="end">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </ActionGroup>
      <ActionGroup as="footer">
        <Button>Start</Button>
      </ActionGroup>
      <ActionGroup stacked>
        <Button>Continue</Button>
        <Button iconOnly icon={<span />} aria-label="More" />
        <IconButton icon={<span />} aria-label="Help" />
        <a href="/help">Help</a>
      </ActionGroup>
      <ActionGroup stacked={stacked}>
        <Button>Unknown</Button>
      </ActionGroup>
    </>
  );
}
