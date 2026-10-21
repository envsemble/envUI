import { Pager } from '@envsemble/envui';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { ArrowForward } from '@envsemble/envui/icons/ArrowForward';

export default function TitlesOnly() {
  return (
    <Pager.Root
      aria-label="Guide pages"
      previous={{ href: '/guide/install', children: 'Install the app', icon: <ArrowBack /> }}
      next={{ href: '/guide/invite', children: 'Invite your team', icon: <ArrowForward /> }}
    />
  );
}
