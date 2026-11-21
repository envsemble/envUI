'use client';

import { createContext, useEffect, useState } from 'react';

function scaffoldPages() {
  let scaffoldMounted = false;
  let titleShown = false;
  return {
    mount() {
      scaffoldMounted = true;
    },
    showTitle() {
      const replacesAnotherPage = scaffoldMounted && titleShown;
      titleShown = true;
      return replacesAnotherPage;
    },
  };
}

type ScaffoldPages = ReturnType<typeof scaffoldPages>;

export const ScaffoldPagesContext = createContext<ScaffoldPages | null>(null);

/** What a Scaffold knows of its pages: whether it has mounted, and whether a page's title showed. */
export function useScaffoldPages() {
  const [pages] = useState(scaffoldPages);
  useEffect(() => pages.mount(), [pages]);
  return pages;
}
