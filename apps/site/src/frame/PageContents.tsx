import type { MouseEvent } from 'react';
import { TableOfContents, type TableOfContentsItem } from '@envsemble/envui';
import { announceShownAddress } from '../routes/Address';

const announceFollowedSectionLink = (event: MouseEvent<HTMLElement>) => {
  const followedSectionLink =
    event.defaultPrevented &&
    event.target instanceof Element &&
    event.target.closest('a[href^="#"]') !== null;
  if (followedSectionLink) announceShownAddress();
};

export function PageContents({
  path,
  items,
}: {
  path: string;
  items: readonly TableOfContentsItem[];
}) {
  return (
    <div className="site-contents">
      <TableOfContents
        key={path}
        className="site-contents-list"
        items={items}
        onClick={announceFollowedSectionLink}
      />
    </div>
  );
}

const fewestListedEntries = 3;

const entriesIn = (items: readonly TableOfContentsItem[]): number =>
  items.reduce((count, item) => count + 1 + entriesIn(item.children ?? []), 0);

export const contentsWorthListing = (items: readonly TableOfContentsItem[] | undefined) =>
  items === undefined || entriesIn(items) >= fewestListedEntries;
