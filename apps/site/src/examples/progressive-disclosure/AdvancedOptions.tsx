import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Button,
  Checkbox,
  Disclosure,
  Select,
  Column,
  Row,
  Text,
  TextField,
} from '@envsemble/envui';

export default function AdvancedOptions() {
  const [format, setFormat] = useState<string | null>('csv');
  const [advanced, setAdvanced] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileNameError, setFileNameError] = useState<string>();
  // The status under the action: the outcome, or the error when an export is refused.
  const [status, setStatus] = useState('');
  const fileNameField = useRef<HTMLInputElement>(null);
  // Counts the refused exports; each focuses the file name once its disclosure has opened.
  const [refused, setRefused] = useState(0);
  useEffect(() => {
    if (refused) fileNameField.current?.focus();
  }, [refused]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (fileName && !/^[\w-]+$/.test(fileName)) {
      const message = 'Use only letters, numbers, hyphens and underscores';
      setFileNameError(message);
      // An error inside the disclosure opens it, so the field and its message show.
      setAdvanced(true);
      // Focusing the field reads its error. After Enter in the field, focus is already there and
      // focusing it again reads nothing, so only then does the status say the error.
      if (document.activeElement === fileNameField.current) setStatus(message);
      else {
        setStatus('');
        setRefused((count) => count + 1);
      }
      return;
    }
    setStatus(`Exported ${fileName || 'quarterly-report'}.${format}.`);
  };

  return (
    <form noValidate onSubmit={submit}>
      {/* envUI has no form column yet: one column, kept to a width that reads easily. */}
      <Column gap={5} style={{ maxInlineSize: '32rem' }}>
        <Select
          label="Format"
          name="format"
          items={formats}
          value={format}
          onValueChange={setFormat}
        />
        {/* Settings most people leave alone wait behind a disclosure; nothing required is in it. */}
        <Disclosure title="Advanced options" open={advanced} onOpenChange={setAdvanced}>
          <Column gap={4}>
            <Checkbox name="archived" label="Include archived projects" />
            <TextField
              ref={fileNameField}
              label="File name (optional)"
              name="fileName"
              description="Without one, the file takes the report’s name."
              suffix={`.${format}`}
              autoComplete="off"
              spellCheck={false}
              value={fileName}
              error={fileNameError}
              onValueChange={(value) => {
                setFileName(value);
                if (!value || /^[\w-]+$/.test(value)) {
                  setFileNameError(undefined);
                  setStatus('');
                }
              }}
            />
          </Column>
        </Disclosure>
        <Row wrap gap={3}>
          <Button type="submit">Export report</Button>
        </Row>
        <Text role="status" emphasis="muted">
          {status}
        </Text>
      </Column>
    </form>
  );
}

const formats = [
  { value: 'csv', label: 'CSV' },
  { value: 'pdf', label: 'PDF' },
  { value: 'xlsx', label: 'Spreadsheet (.xlsx)' },
];
