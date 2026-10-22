import { Pager } from '@envsemble/envui';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { ArrowForward } from '@envsemble/envui/icons/ArrowForward';

export default function PagerAnatomy() {
  return (
    <Pager.Root
      aria-label="Guide pages"
      style={{ inlineSize: 'min(100%, 30rem)' }}
      previous={{ href: '/guide/install', children: 'Install the app', icon: <ArrowBack /> }}
      next={{ href: '/guide/invite', children: 'Invite your team', icon: <ArrowForward /> }}
    />
  );
}
