import { DirectionLink, DirectionLinks } from '@envsemble/envui';
import type {
  DirectionLinkProps,
  DirectionLinksDestination,
  DirectionLinksProps,
} from '@envsemble/envui';

type Destination = DirectionLinksDestination;

export function ArticlePager(props: DirectionLinksProps & { previous: Destination; next: DirectionLinkProps }) {
  return (
    <DirectionLinks>
      <DirectionLink direction="previous" href={props.previous.href} title="Getting started" />
      <DirectionLink direction={'next'} href="/guides/themes">
        Themes
      </DirectionLink>
      <DirectionLink direction={`next`} href="/guides/layout" />
    </DirectionLinks>
  );
}
