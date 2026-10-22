import { Checkbox, Column, Disclosure, Select, TextField } from '@envsemble/envui';

const formats = [
  { value: 'csv', label: 'CSV' },
  { value: 'xlsx', label: 'Excel workbook' },
];

export default function OneLevel() {
  // Every optional setting behind one summary, a single press away.
  return (
    <Column gap={4} style={{ inlineSize: 'min(100%, 20rem)' }}>
      <TextField label="File name" defaultValue="quarterly-report" />
      <Disclosure title="Advanced options" defaultOpen>
        <Column gap={3}>
          <Select label="Format" items={formats} defaultValue="csv" />
          <Checkbox label="Include archived projects" />
        </Column>
      </Disclosure>
    </Column>
  );
}
