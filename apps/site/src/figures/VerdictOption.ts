/**
 * Temporary, while the owner chooses: the second way to draw a do or don't figure (Verdicts.css),
 * by `?verdicts=2`, kept for the tab's session; `?verdicts=1` or any other value goes back to the
 * first, the default. The choice is `data-catalogue-verdicts` on the document's root.
 */
const verdictKey = 'envui-site-verdicts';

export function applyVerdictOption(): void {
  let option: string | null = null;
  try {
    const asked = new URLSearchParams(location.search).get('verdicts');
    if (asked === null) option = sessionStorage.getItem(verdictKey);
    else if (asked === '2') {
      option = asked;
      sessionStorage.setItem(verdictKey, asked);
    } else sessionStorage.removeItem(verdictKey);
  } catch {
    // Without storage the choice holds for the page it was asked on.
  }
  if (option === '2') document.documentElement.setAttribute('data-catalogue-verdicts', option);
}
