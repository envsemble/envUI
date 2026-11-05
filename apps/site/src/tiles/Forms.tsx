import { useState } from 'react';
import { Button, Column, Row, TextField } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

const email = '.env-text-field:nth-child(2 of .env-text-field) .env-text-field-input';

/*
 * At rest the form has been submitted with the email half typed, which says what is wrong under
 * the field. The address finished clears it; erased and submitted again, the error is back.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: email, x: 0.75 },
  { wait: 250 },
  { click: true },
  { wait: 200 },
  { type: 'example.com', into: email, every: 80 },
  // About two seconds with the address whole, so the error's going registers.
  { wait: 3200 },
  { erase: 11, into: email, every: 40 },
  { wait: 300 },
  { to: '.env-button', duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 400 },
];

const whole = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/** A short form, checked as it is submitted, whose error goes as soon as it is put right. */
export default function FormsTile() {
  const [address, setAddress] = useState('sam.lee@');
  const [checked, setChecked] = useState(true);
  usePointer(script);
  return (
    // As tall as the form with its error, the button at its foot, so the form keeps its place as
    // the error comes and goes.
    <Column gap={4} style={{ inlineSize: '17rem', minBlockSize: '10.5rem' }}>
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
      <Row justify="end" style={{ marginBlockStart: 'auto' }}>
        <Button onClick={() => setChecked(true)}>Create project</Button>
      </Row>
    </Column>
  );
}
