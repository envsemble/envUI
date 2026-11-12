import { useState } from 'react';
import { Button, Column, Row, TextField } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import type { TileWindow } from './Tiles';

const email = '.env-text-field:nth-child(2 of .env-text-field) .env-text-field-input';

/*
 * At rest the form has been submitted with the email half typed, so an error under the field says
 * what is wrong. Finishing the address clears it. Selecting its domain, deleting it and submitting
 * again brings the error back.
 */
const script: PointerStep[] = [
  { wait: 240 },
  { to: email, x: 0.75 },
  { wait: 150 },
  { click: true },
  { wait: 120 },
  { type: 'example.com', into: email, every: 80 },
  // About two seconds with the whole address, so the error going away registers.
  { wait: 1560 },
  // The domain is selected with a drag and deleted, so the address is visibly put back by hand.
  { to: email, text: 'example.com', x: 0, duration: 450 },
  { press: true },
  { to: email, text: 'example.com', x: 1, duration: 450 },
  { release: true, stay: true },
  { wait: 420 },
  { erase: 1, into: email },
  { wait: 240 },
  { to: '.env-button', duration: 450 },
  { wait: 180 },
  { click: true },
  { wait: 540 },
  { leave: true },
  { wait: 240 },
];

const whole = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/** A larger window than the tiles' (TileStage.css), drawn smaller: the component doesn't fit theirs. */
export const tileWindow: TileWindow = { width: 20, height: 15 };

/** A short form, checked when it is submitted, whose error goes away as soon as it is corrected. */
export default function FormsTile() {
  const [address, setAddress] = useState('sam.lee@');
  const [checked, setChecked] = useState(true);
  usePointer(script);
  return (
    // As tall as the form with its error, with the button at its bottom, so the form keeps its
    // place as the error comes and goes.
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
