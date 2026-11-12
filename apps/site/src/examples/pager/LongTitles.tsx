import { Pager } from '@envsemble/envui';
import { IconArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { IconArrowForward } from '@envsemble/envui/icons/ArrowForward';

export default function LongTitles() {
  return (
    <Pager.Root aria-label="Handbook pages">
      <Pager.Previous href="/handbook/reviews" icon={<IconArrowBack />}>
        Reviews & readable feedback
      </Pager.Previous>
      <Pager.Next href="/handbook/security" icon={<IconArrowForward />}>
        Security & access across every workspace
      </Pager.Next>
    </Pager.Root>
  );
}
