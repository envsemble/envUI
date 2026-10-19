import { Pager } from '@envsemble/envui';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { ArrowForward } from '@envsemble/envui/icons/ArrowForward';

export default function LongTitles() {
  return (
    // As narrow as a phone's column, too narrow for both links side by side.
    <div style={{ inlineSize: 'min(100%, 16rem)' }}>
      <Pager.Root
        aria-label="Long destinations"
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
    </div>
  );
}
