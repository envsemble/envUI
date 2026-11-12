import { createContext, useContext, type MouseEvent } from 'react';
import { Disclosure, TableOfContents, type TableOfContentsItem } from '@envsemble/envui';
import { announceShownAddress } from '../routes/Address';

/**
 * A link of the contents writes the section's fragment to the address, the same as a search result
 * or a copied address names it, and the route follows without scrolling again.
 */
const followed = (event: MouseEvent<HTMLElement>) => {
  if (
    event.defaultPrevented &&
    event.target instanceof Element &&
    event.target.closest('a[href^="#"]')
  )
    announceShownAddress();
};

/**
 * The page's contents beside it, in the catalogue and the Docs alike, on a window wide enough for
 * a column of them: its sections, its h2 headings, with the one the reader is in marked. The page
 * gives them from what it renders (usePageContents), not from its headings once it has mounted, so
 * they are whole from the first render, the server's included. Its sections alone: a component
 * page's subsections, such as each variant or each export's props, would make a list of two dozen
 * links, longer than the window, where the sections are the way around the page.
 */
export function PageContents({
  path,
  items,
}: {
  path: string;
  items: readonly TableOfContentsItem[];
}) {
  return (
    <div className="site-contents">
      <TableOfContents key={path} className="site-contents-list" items={items} onClick={followed} />
    </div>
  );
}

/**
 * The sections of the page shown where it has contents, which its banner then offers where they
 * aren't beside it; none where it has none.
 */
export const ContentsItems = createContext<readonly TableOfContentsItem[] | undefined>(undefined);

/**
 * The same contents under the page's banner, closed, where the window is too narrow for them beside
 * the page (Shell.css), so a phone reaches the page's sections too.
 */
export function CompactContents() {
  const items = useContext(ContentsItems);
  if (!items) return null;
  return (
    <Disclosure title="On this page" className="site-compact-contents">
      <TableOfContents items={items} onClick={followed} />
    </Disclosure>
  );
}
