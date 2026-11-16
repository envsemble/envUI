import { Radio, RadioGroup } from '@envsemble/envui';

export default function SideBySide() {
  return (
    <RadioGroup label="Export format" orientation="horizontal" defaultValue="csv">
      <Radio value="csv" label="CSV" />
      <Radio value="json" label="JSON" />
      <Radio value="markdown" label="Markdown" />
    </RadioGroup>
  );
}
