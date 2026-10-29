import { Pager } from '@envsemble/envui';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { ArrowForward } from '@envsemble/envui/icons/ArrowForward';

export default function LongTitles() {
  return (
    <Pager.Root aria-label="Handbook pages">
      <Pager.Previous href="/handbook/reviews" icon={<ArrowBack />}>
        Reviews & readable feedback
      </Pager.Previous>
      <Pager.Next href="/handbook/security" icon={<ArrowForward />}>
        Security & access across every workspace
      </Pager.Next>
    </Pager.Root>
  );
}
