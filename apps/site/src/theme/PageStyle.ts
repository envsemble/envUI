/**
 * A design exploration of the catalogue's component and pattern pages: one of three looks, chosen
 * by `?pagestyle=a`, `b` or `c` and kept for the tab's session as the reader moves between pages;
 * `?pagestyle=` with another value or none goes back to the current look. The look is the
 * `data-page-style` attribute on the document's root, which PageStyles.css reads; without it the
 * pages are as they are.
 */
const pageStyles = ['a', 'b', 'c'] as const;
const pageStyleKey = 'envui-site-page-style';

export function applyPageStyle(): void {
  let style: string | null = null;
  try {
    const asked = new URLSearchParams(location.search).get('pagestyle');
    if (asked === null) style = sessionStorage.getItem(pageStyleKey);
    else if ((pageStyles as readonly string[]).includes(asked)) {
      style = asked;
      sessionStorage.setItem(pageStyleKey, asked);
    } else sessionStorage.removeItem(pageStyleKey);
  } catch {
    // Without storage the look holds for the page it was asked on.
  }
  if (style && (pageStyles as readonly string[]).includes(style))
    document.documentElement.setAttribute('data-page-style', style);
}
