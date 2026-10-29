import { Pager } from '@envsemble/envui';
import { IconArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { IconArrowForward } from '@envsemble/envui/icons/ArrowForward';

export default function PagerAnatomy() {
  return (
    <Pager.Root aria-label="Guide pages" style={{ inlineSize: 'min(100%, 30rem)' }}>
      <Pager.Previous href="/guide/install" icon={<IconArrowBack />}>
        Install the app
      </Pager.Previous>
      <Pager.Next href="/guide/invite" icon={<IconArrowForward />}>
        Invite your team
      </Pager.Next>
    </Pager.Root>
  );
}
