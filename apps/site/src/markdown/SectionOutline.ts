import { createContext, useContext } from 'react';
import { flag } from '../shared/Attributes';

export const SectionOutline = createContext(false);

export const useSectionOutline = () => useContext(SectionOutline);

export const pendingAttribute = (outline: boolean) => ({
  'data-site-pending': flag(outline),
});

export function headingsOnly(markdown: string) {
  let fence: string | undefined;
  const headings: string[] = [];
  for (const line of markdown.split('\n')) {
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/)?.[1];
    const opensFence = marker && !fence;
    const closesFence = marker && fence && marker[0] === fence[0] && marker.length >= fence.length;
    if (opensFence || closesFence) fence = fence ? undefined : marker;
    else if (!fence && /^\s{0,3}#{1,6}\s/.test(line)) headings.push(line.trim());
  }
  return headings.join('\n\n');
}
