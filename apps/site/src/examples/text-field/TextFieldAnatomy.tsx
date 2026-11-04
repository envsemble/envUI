import { IconButton, TextField } from '@envsemble/envui';
import { IconContentCopy } from '@envsemble/envui/icons/ContentCopy';
import { IconLink } from '@envsemble/envui/icons/Link';

export default function TextFieldAnatomy() {
  return (
    <TextField
      label="Address"
      name="slug"
      startIcon={<IconLink />}
      prefix="example.com/"
      defaultValue="northwind"
      endAction={<IconButton icon={<IconContentCopy />} aria-label="Copy address" />}
      description="Used in links to the project."
      style={{ inlineSize: 'min(100%, 26rem)' }}
    />
  );
}
