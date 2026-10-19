import { Pager } from '@envsemble/envui';

type Destination = Pager.LinkProps;

export function ArticlePager(props: Pager.RootProps & { previous: Destination; next: Pager.LinkProps }) {
  return (
    <Pager.Root>
      <Pager.Previous href={props.previous.href} title="Getting started" />
      <Pager.Next href="/guides/themes">
        Themes
      </Pager.Next>
      <Pager.Next href="/guides/layout" />
    </Pager.Root>
  );
}
