import { useId, useState } from 'react';
import { Button, Radio, RadioGroup, Stack, Text } from '@envsemble/envui';

const formats: Record<string, string> = { csv: 'CSV', json: 'JSON', markdown: 'Markdown' };

export default function RequiredChoice() {
  const errorId = useId();
  const [format, setFormat] = useState<string>();
  const [error, setError] = useState<string>();
  const [exported, setExported] = useState<string>();
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!format) {
          setError('Choose a format to export.');
          // Take people to the choice they missed.
          event.currentTarget.querySelector<HTMLInputElement>('input[name="format"]')?.focus();
          return;
        }
        setExported(format);
      }}
    >
      <Stack gap={4} align="start">
        <RadioGroup
          label="Export format"
          name="format"
          required
          value={format}
          onValueChange={(value) => {
            setFormat(value);
            setError(undefined);
            setExported(undefined);
          }}
          aria-describedby={error ? errorId : undefined}
        >
          {Object.entries(formats).map(([value, label]) => (
            <Radio key={value} value={value} label={label} />
          ))}
        </RadioGroup>
        {error && (
          <Text id={errorId} variant="supporting" role="alert">
            {error}
          </Text>
        )}
        <Button type="submit">Export</Button>
        <Text role="status">
          {exported && `Exported Northwind launch as ${formats[exported]}.`}
        </Text>
      </Stack>
    </form>
  );
}
