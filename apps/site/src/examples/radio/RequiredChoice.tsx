import { useState } from 'react';
import { Button, Radio, RadioGroup, Column, Text } from '@envsemble/envui';

const formats: Record<string, string> = { csv: 'CSV', json: 'JSON', markdown: 'Markdown' };

export default function RequiredChoice() {
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
      <Column gap={4} align="start">
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
          error={error}
        >
          {Object.entries(formats).map(([value, label]) => (
            <Radio key={value} value={value} label={label} />
          ))}
        </RadioGroup>
        <Button type="submit">Export</Button>
        <Text role="status">
          {exported && `Exported Northwind launch as ${formats[exported]}.`}
        </Text>
      </Column>
    </form>
  );
}
