import { Pager } from '@envsemble/envui';
import { ArrowForward } from '@envsemble/envui/icons/ArrowForward';

export default function IconOnOne() {
  return (
    // An icon on one link only: the pair no longer reads as one.
    <Pager.Root
      aria-label="Guide pages"
      previous={{ href: '/guide/overview', children: 'Overview' }}
      next={{ href: '/guide/install', children: 'Install', icon: <ArrowForward /> }}
    />
  );
}
