import { Composer } from '@envsemble/envui';

const send = () => undefined;

export default function GrowingDraft() {
  return (
    <Composer
      aria-label="Message"
      defaultValue="Can you summarise the pricing research and list the open questions for Friday?"
      onSubmit={send}
    />
  );
}
