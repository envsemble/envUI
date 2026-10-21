import { Composer } from '@envsemble/envui';

const send = () => undefined;

export default function ShortFooter() {
  return (
    <Composer
      aria-label="Comment"
      placeholder="Add a comment"
      footer="Files up to 10 MB."
      onSubmit={send}
      style={{ inlineSize: 'min(100%, 26rem)' }}
    />
  );
}
