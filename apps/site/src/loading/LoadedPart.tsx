import { Suspense, useState, type ReactNode } from 'react';
import { LoadBoundary, type lazyPart } from './LoadBoundary';

/**
 * A large part of a page that loads with the page that shows it, such as the token reference or
 * the changelog, in place, with a retry where it fails to load. Until it has loaded, `placeholder`
 * holds its place: its headings, which the page's contents list from the start, over skeletons of
 * what they head.
 */
export function LoadedPart({
  part,
  what,
  placeholder,
}: {
  part: ReturnType<typeof lazyPart<unknown, object>>;
  what: string;
  placeholder: ReactNode;
}) {
  const [, setAttempt] = useState(0);
  const Part = part.component;
  return (
    <LoadBoundary
      what={what}
      modules={part.modules}
      onRetry={() => {
        part.retry();
        setAttempt((count) => count + 1);
      }}
    >
      <Suspense fallback={placeholder}>
        <Part />
      </Suspense>
    </LoadBoundary>
  );
}
