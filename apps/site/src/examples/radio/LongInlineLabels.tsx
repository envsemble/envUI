import { Radio, RadioGroup } from '@envsemble/envui';

export default function LongInlineLabels() {
  return (
    <RadioGroup label="Role" defaultValue="editor">
      <Radio value="editor" label="Editor, who changes plans and invites people" />
      <Radio value="viewer" label="Viewer, who reads plans and comments" />
    </RadioGroup>
  );
}
