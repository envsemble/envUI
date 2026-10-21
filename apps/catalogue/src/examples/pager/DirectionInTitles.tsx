import { Pager } from '@envsemble/envui';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { ArrowForward } from '@envsemble/envui/icons/ArrowForward';

export default function DirectionInTitles() {
  return (
    // The direction is said twice: by the label and again in the title.
    <Pager.Root
      aria-label="Guide pages"
      previous={{ href: '/guide/install', children: 'Back to install', icon: <ArrowBack /> }}
      next={{ href: '/guide/invite', children: 'Next: invite', icon: <ArrowForward /> }}
    />
  );
}
