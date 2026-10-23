import { Button, CloseButton } from '@envsemble/envui';
import { Close } from '@envsemble/envui/icons/Close';
import { Settings } from '@envsemble/envui/icons/Settings';

export function Panel({ onClose, compact, save }) {
  return (
    <>
      <Button iconOnly={compact} icon={<Settings />} aria-label="Settings" />
      <Button {...save}>Save</Button>
      <Button iconOnly={false}>Save</Button>
      <Button iconOnly icon={<Settings />} aria-label="Settings" variant="ghost" />
      <Button iconOnly icon={<Settings />} aria-label="Settings" />
      <Button iconOnly icon={<Settings />} aria-label="Delete" tone="danger" fullWidth />
      <Button iconOnly icon={<Settings />} aria-label="Help" variant="text" underline />
      <CloseButton onClick={onClose} />
      <CloseButton aria-label="Remove Alex Morgan" size="sm" variant="secondary" />
      <Close />
    </>
  );
}
