import { Radio, RadioGroup } from '@envsemble/envui';

export default function WrappingOptions() {
  return (
    <RadioGroup label="Export format" defaultValue="csv">
      <Radio value="csv" label="CSV" />
      <Radio value="json" label="JSON" />
      <Radio value="markdown" label="Markdown" />
      <Radio value="spreadsheet" label="Spreadsheet" />
    </RadioGroup>
  );
}
