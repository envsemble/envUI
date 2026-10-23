import { Pager } from '@envsemble/envui';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { ArrowForward } from '@envsemble/envui/icons/ArrowForward';

export default function IconsOnBoth() {
  return (
    <Pager.Root
      aria-label="Guide pages, icons on both"
      previous={{ href: '/guide/overview', children: 'Overview', icon: <ArrowBack /> }}
      next={{ href: '/guide/install', children: 'Install', icon: <ArrowForward /> }}
    />
  );
}
