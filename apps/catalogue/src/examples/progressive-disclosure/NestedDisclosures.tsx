import { Checkbox, Column, Disclosure, Select, TextField } from '@envsemble/envui';

const formats = [
  { value: 'csv', label: 'CSV' },
  { value: 'xlsx', label: 'Excel workbook' },
];

export default function NestedDisclosures() {
  // A summary inside a summary: the last setting waits two presses away.
  return (
    <Column gap={4} style={{ inlineSize: 'min(100%, 20rem)' }}>
      <TextField label="File name" defaultValue="quarterly-report" />
      <Disclosure title="Advanced options" defaultOpen>
        <Column gap={3}>
          <Select label="Format" items={formats} defaultValue="csv" />
          <Disclosure title="More options">
            <Checkbox label="Include archived projects" />
          </Disclosure>
        </Column>
      </Disclosure>
    </Column>
  );
}
