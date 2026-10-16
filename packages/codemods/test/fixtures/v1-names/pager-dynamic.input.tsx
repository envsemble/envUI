import { DirectionLink, DirectionLinks } from '@envsemble/envui';

const links = [{ direction: 'previous' as const, href: '/a' }];

export function DynamicPager({ direction }: { direction: 'previous' | 'next' }) {
  return (
    <DirectionLinks>
      <DirectionLink direction="previous" href="/guides" />
      <DirectionLink direction={direction} href="/guides/next" />
      {links.map((link) => (
        <DirectionLink key={link.href} {...link} />
      ))}
    </DirectionLinks>
  );
}

export const LinkComponent = DirectionLink;
