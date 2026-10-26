import { Pager } from '@envsemble/envui';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { ArrowForward } from '@envsemble/envui/icons/ArrowForward';

export default function LongTitles() {
  return (
    <Pager.Root
      aria-label="Handbook pages"
      previous={{
        href: '/handbook/reviews',
        children: 'Reviews & readable feedback',
        icon: <ArrowBack />,
      }}
      next={{
        href: '/handbook/security',
        children: 'Security & access across every workspace',
        icon: <ArrowForward />,
      }}
    />
  );
}
