import { useEffect, useRef } from 'react';
import { remPixels } from '../shared/Lengths';

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
    const contentTop = (item: Element) =>
      item.getBoundingClientRect().top - frame.top + list.scrollTop;
    const linkTop = contentTop(link);
    const fadeRem = parseFloat(
      getComputedStyle(list).getPropertyValue('--site-drawer-fade-length'),
    );
    const fadeClearance = (fadeRem || 0) * remPixels();
    const upperTwoThirds = (list.clientHeight * 2) / 3;
    const aThirdDown = list.clientHeight / 3;
    const heading = link
      .closest('.env-navigation-drawer-section')
      ?.querySelector('.env-navigation-drawer-group-label');
    if (heading && linkTop - (contentTop(heading) - fadeClearance) <= upperTwoThirds) {
      list.scrollTop = contentTop(heading) - fadeClearance;
      return;
    }
    const target = linkTop - aThirdDown;
    const maxScrollTop = list.scrollHeight - list.clientHeight;
    const rows = [...list.querySelectorAll('.env-navigation-drawer-item')]
      .filter((row) => row.checkVisibility())
      .map(contentTop)
      .filter((row) => row <= maxScrollTop);
    list.scrollTop = rows.reduce(
      (best, row) => (Math.abs(row - target) < Math.abs(best - target) ? row : best),
      Infinity,
    );
  }, []);
  return element;
}
