import { useRef, useState, type RefObject } from 'react';
import { useFiguresMounted } from '../loading/useFiguresMounted';
import { useNear } from './useNear';

/**
 * Whether a figure's subject, its example, specimen or picture, which renders in the browser
 * alone, renders yet rather than its skeleton, whose element is `place`. Rendered in the browser
 * alone, a page's subjects render at once. A pre-rendered page's render once it has hydrated, each
 * once its skeleton nears the view, as a gallery's tiles do (useNear): those in view at once, those
 * close to it one after another as the page is idle, and the rest as the reader scrolls to them.
 * Rendering them all as it hydrates held up the page that was already showing, for subjects that
 * may never be scrolled to. Without `place`, as a tile's picture whose tile watches the view
 * itself, it renders once the page has hydrated.
 */
export function useSubjectShown(place?: RefObject<HTMLElement | null>) {
  // The site's own, which turns in a transition after hydrating: a figure mounting is no reason
  // to render the page again in one task.
  const hydrated = useFiguresMounted();
  // Whether the page was pre-rendered, as the first render tells: the page hydrates it.
  const [prerendered] = useState(!hydrated);
  const nothing = useRef<HTMLElement>(null);
  const near = useNear(place ?? nothing);
  return hydrated && (!prerendered || !place || near);
}
