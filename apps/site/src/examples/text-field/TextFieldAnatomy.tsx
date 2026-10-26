import { IconButton, TextField } from '@envsemble/envui';
import { ContentCopy } from '@envsemble/envui/icons/ContentCopy';
import { Link } from '@envsemble/envui/icons/Link';

export default function TextFieldAnatomy() {
  return (
    <TextField
      label="Address"
      name="slug"
      startIcon={<Link />}
      prefix="example.com/"
      defaultValue="northwind"
      endAction={<IconButton icon={<ContentCopy />} aria-label="Copy address" />}
      description="Used in links to the project."
      style={{ inlineSize: 'min(100%, 26rem)' }}
    />
  );
}
