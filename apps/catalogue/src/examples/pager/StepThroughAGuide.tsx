import { useState } from 'react';
import { Pager, Column, Text } from '@envsemble/envui';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { ArrowForward } from '@envsemble/envui/icons/ArrowForward';

const pages = [
  { href: '/guide/overview', title: 'Overview' },
  { href: '/guide/install', title: 'Install the app' },
  { href: '/guide/invite', title: 'Invite your team' },
  { href: '/guide/next-steps', title: 'Next steps' },
];

export default function StepThroughAGuide() {
  // The router knows the current page; here a click stands in for it.
  const [index, setIndex] = useState(0);
  const previous = pages[index - 1];
  const next = pages[index + 1];
  return (
    <Column gap={5}>
      <Text render={<h3 />} variant="title">
        {pages[index].title}
      </Text>
      <Pager.Root
        aria-label="Setup guide"
        previous={
          previous && {
            href: previous.href,
            children: previous.title,
            icon: <ArrowBack />,
            onClick: () => setIndex(index - 1),
          }
        }
        next={
          next && {
            href: next.href,
            children: next.title,
            icon: <ArrowForward />,
            onClick: () => setIndex(index + 1),
          }
        }
      />
    </Column>
  );
}
