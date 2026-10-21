import { Composer } from '@envsemble/envui';

const send = () => undefined;

export default function PendingStaysEditable() {
  return (
    <Composer
      aria-label="Message"
      defaultValue="And the budget for the spring launch?"
      pending
      onSubmit={send}
      style={{ inlineSize: 'min(100%, 26rem)' }}
    />
  );
}
