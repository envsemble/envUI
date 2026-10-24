import { Suspense, useState } from 'react';
import { Text } from '@envsemble/envui';
import { LoadBoundary, type lazyPart } from '../template/LoadBoundary';

/**
 * A large part of a page that loads with the page that shows it, such as the token reference or
 * the changelog, in place, with a retry where it fails to load.
 */
export function LoadedPart({
  part,
  what,
}: {
  part: ReturnType<typeof lazyPart<unknown, object>>;
  what: string;
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
      <Suspense fallback={<Text role="status">Loading the {what}…</Text>}>
        <Part />
      </Suspense>
    </LoadBoundary>
  );
}
