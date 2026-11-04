import { useState } from 'react';
import { Button, Column, Row, TextField } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

const email = '.env-text-field:nth-child(2 of .env-text-field) .env-text-field-input';

/*
 * Created with the email half typed, which says what is wrong under the field; the address
 * finished, which clears it; and erased back to where it began.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-button' },
  { wait: 300 },
  { click: true },
  { wait: 1100 },
  { to: email, x: 0.75, duration: 450 },
  { click: true },
  { wait: 200 },
  { type: 'example.com', into: email, every: 90 },
  { wait: 1200 },
  { erase: 11, into: email, every: 40 },
  { wait: 300 },
  { leave: true },
  { wait: 400 },
];

const whole = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/** A short form, checked as it is submitted, whose error goes as soon as it is put right. */
export default function FormsTile() {
  const [address, setAddress] = useState('sam.lee@');
  const [checked, setChecked] = useState(false);
  usePointer(script);
  return (
    <Column gap={4} style={{ inlineSize: '15rem' }}>
      <TextField label="Project name" defaultValue="Northwind launch" />
      <TextField
        label="Owner's email"
        value={address}
        onValueChange={(value) => {
          setAddress(value);
          if (whole(value)) setChecked(false);
        }}
        error={checked && !whole(address) ? 'Enter a whole email address' : undefined}
      />
      <Row justify="end">
        <Button onClick={() => setChecked(true)}>Create project</Button>
      </Row>
    </Column>
  );
}
