import { Pager } from '@envsemble/envui';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { ArrowForward } from '@envsemble/envui/icons/ArrowForward';

export default function PreviousAndNext() {
  return (
    <Pager.Root aria-label="Guide pages">
      <Pager.Previous href="/guide/install" icon={<ArrowBack />}>
        Install the app
      </Pager.Previous>
      <Pager.Next href="/guide/invite" icon={<ArrowForward />}>
        Invite your team
      </Pager.Next>
    </Pager.Root>
  );
}
