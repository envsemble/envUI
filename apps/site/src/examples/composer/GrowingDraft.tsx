import { Composer } from '@envsemble/envui';

const send = () => undefined;

const draft =
  'Can you summarise the pricing research and list the open questions for Friday? ' +
  'Add the customer quotes we liked, too.';

export default function GrowingDraft() {
  return (
    // The field grows with its text up to four lines, then scrolls.
    <Composer aria-label="Message" maxRows={4} defaultValue={draft} onSend={send} />
  );
}
