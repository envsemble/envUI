import { createContext, useContext, type MouseEvent } from 'react';
import { Disclosure, TableOfContents, type TableOfContentsItem } from '@envsemble/envui';
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

export const ContentsItems = createContext<readonly TableOfContentsItem[] | undefined>(undefined);

export function CompactContents() {
  const items = useContext(ContentsItems);
  if (!items) return null;
  return (
    <Disclosure title="On this page" className="site-compact-contents">
      <TableOfContents items={items} onClick={announceFollowedSectionLink} />
    </Disclosure>
  );
}
