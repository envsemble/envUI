import { Pager, DirectionLink } from '@envsemble/envui';

const links = [{ direction: 'previous' as const, href: '/a' }];

export function DynamicPager({ direction }: { direction: 'previous' | 'next' }) {
  return (
    <Pager.Root>
      <Pager.Previous href="/guides" />
      <DirectionLink direction={direction} href="/guides/next" />
      {links.map((link) => (
        <DirectionLink key={link.href} {...link} />
      ))}
    </Pager.Root>
  );
}

export const LinkComponent = DirectionLink;
