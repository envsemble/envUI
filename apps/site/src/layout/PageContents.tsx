import { createContext, useContext, type MouseEvent } from 'react';
import { Disclosure, TableOfContents } from '@envsemble/envui';
import { announceShownAddress } from '../navigation/Address';
import type { RoutePage } from '../navigation/SiteRoutes';

/**
 * Whether a heading belongs in the page's contents: one of the page's own, not an example's, a
 * figure's or a tile's, which show components rather than the page's sections. A tile's picture is
 * inert, but a tile that shows an overlay open, such as a sheet, marks the page around it as behind
 * a popup, where the contents keep what is hidden, so its tiles' headings are left out by name. Each
 * export's props are listed under Props; the exports' part names and color properties, and the two
 * lists under Accessibility, are their sections' alone, so the contents don't repeat the exports
 * three times.
 */
const contentsHeading = (heading: HTMLElement) =>
  !heading.closest(
    '.site-live-example, .site-verdict-stage, .site-anatomy-stage, .catalogue-open-example, .catalogue-specimen, .catalogue-related-stage, .env-dialog',
  ) &&
  !(
    heading.localName === 'h3' &&
    heading.closest(
      '.docs-provides, [aria-labelledby="part-names"], [aria-labelledby="color-properties"]',
    )
  );

/**
 * A link of the contents writes the section's fragment to the address, the same as a search result
 * or a copied address names it, and the route follows without scrolling again.
 */
const followed = (event: MouseEvent<HTMLElement>) => {
  if (event.defaultPrevented && (event.target as Element).closest('a[href^="#"]'))
    announceShownAddress();
};

/**
 * The page's contents beside it, in the catalogue and the Docs alike, on a window wide enough for
 * a column of them: its h2 and h3 headings, such as a component's rules under Rules or each
 * export's props under Props, with the section the reader is in marked.
 */
export function PageContents({ page }: { page: RoutePage }) {
  return (
    <div className="site-contents">
      <TableOfContents
        key={page.path}
        className="site-contents-list"
        container=".site-page-column"
        filter={contentsHeading}
        onClick={followed}
      />
    </div>
  );
}

/** Whether the page shown has contents, which its banner then offers where they aren't beside it. */
export const HasContents = createContext(false);

/**
 * The same contents under the page's banner, closed, where the window is too narrow for them beside
 * the page (Shell.css), so a phone reaches the page's sections too.
 */
export function CompactContents() {
  if (!useContext(HasContents)) return null;
  return (
    <Disclosure title="On this page" className="site-compact-contents">
      <TableOfContents container=".site-page-column" filter={contentsHeading} onClick={followed} />
    </Disclosure>
  );
}
