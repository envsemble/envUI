import { Radio, RadioGroup } from '@envsemble/envui';

export default function DescribedRows() {
  return (
    <RadioGroup
      orientation="vertical"
      label="Role"
      defaultValue="editor"
      style={{ inlineSize: 'min(100%, 20rem)' }}
    >
      <Radio value="editor" label="Editor" description="Changes plans and invites people." />
      <Radio value="viewer" label="Viewer" description="Reads plans and comments." />
    </RadioGroup>
  );
}
