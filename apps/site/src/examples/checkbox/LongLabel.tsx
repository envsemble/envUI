import { Checkbox } from '@envsemble/envui';

export default function LongLabel() {
  return (
    <Checkbox
      label="Send a copy of every comment on plans I follow to my e-mail address"
      defaultChecked
    />
  );
}
