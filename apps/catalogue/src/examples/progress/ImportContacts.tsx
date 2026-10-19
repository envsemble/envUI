import { Progress } from '@envsemble/envui';

const imported = 120;
const total = 480;

export default function ImportContacts() {
  return (
    <Progress
      label="Importing contacts"
      value={imported}
      max={total}
      valueText={`${imported} of ${total}`}
      aria-valuetext={`${imported} of ${total} contacts`}
    />
  );
}
