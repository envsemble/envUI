import { Button, IconButton } from '@envsemble/envui';
import { Close } from '@envsemble/envui/icons/Close';
import { Settings } from '@envsemble/envui/icons/Settings';

export function Panel({ onClose, compact, save }) {
  return (
    <>
      <Button iconOnly={compact} icon={<Settings />} aria-label="Settings" />
      <Button {...save}>Save</Button>
      <Button>Save</Button>
      <IconButton icon={<Settings />} aria-label="Settings" variant="ghost" />
      <IconButton icon={<Settings />} aria-label="Settings" />
      <IconButton icon={<Settings />} aria-label="Delete" tone="danger" fullWidth />
      <IconButton icon={<Settings />} aria-label="Help" variant="text" underline />
      <IconButton variant="ghost" icon={<Close />} aria-label="Close" onClick={onClose} />
      <IconButton
        icon={<Close />}
        aria-label="Remove Alex Morgan"
        size="sm"
        variant="secondary" />
      <Close />
    </>
  );
}
