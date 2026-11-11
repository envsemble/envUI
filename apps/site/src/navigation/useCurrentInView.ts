import { useEffect, useRef } from 'react';
import { remPixels } from '@envui-internal/internal/dom/lengths';

/**
 * Scrolls the drawer's list as the navigation mounts so the current page's link shows, as on a page
 * deep in it, rather than at its foot. The list starts where nothing is cut short under its faded
 * top edge (Shell.css): at the heading of the link's group, such as Components, clear of the fade,
 * where that leaves the link in the upper two thirds of the list; else at a whole row, with the
 * link a third of the way down. A link already in view leaves the list where it is.
 */
export function useCurrentInView() {
  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const link = element.current?.querySelector<HTMLElement>(
      '.env-navigation-drawer [aria-current="page"]',
    );
    const list = link?.closest<HTMLElement>('.env-navigation-drawer-list');
    if (!link || !list) return;
    const frame = list.getBoundingClientRect();
    const top = link.getBoundingClientRect().top - frame.top;
    if (top >= 0 && top + link.offsetHeight <= list.clientHeight) return;
    // Where an element starts in the list's content, whatever it is scrolled to.
    const at = (item: Element) => item.getBoundingClientRect().top - frame.top + list.scrollTop;
    const linkAt = at(link);
    const fade = parseFloat(getComputedStyle(list).getPropertyValue('--site-drawer-fade-length'));
    const clear = (fade || 0) * remPixels();
    const heading = link
      .closest('.env-navigation-drawer-section')
      ?.querySelector('.env-navigation-drawer-group-label');
    if (heading && linkAt - (at(heading) - clear) <= (list.clientHeight * 2) / 3) {
      list.scrollTop = at(heading) - clear;
      return;
    }
    const target = linkAt - list.clientHeight / 3;
    // The rows that show, those of a closed section laid out nowhere, and that the list can scroll
    // to the top of: near its end, the last whole rows show at its foot instead.
    const end = list.scrollHeight - list.clientHeight;
    const rows = [...list.querySelectorAll('.env-navigation-drawer-item')]
      .filter((row) => row.checkVisibility())
      .map(at)
      .filter((row) => row <= end);
    list.scrollTop = rows.reduce(
      (best, row) => (Math.abs(row - target) < Math.abs(best - target) ? row : best),
      Infinity,
    );
  }, []);
  return element;
}
