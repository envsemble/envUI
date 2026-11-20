import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLatest } from '../../../internal/react/useLatest.js';
import { useControllableState } from '../../../internal/react/useControllableState.js';
import type { NavigationDrawerDestination } from '../../destinations.js';
import { destinationKey } from '../destinationModel.js';

export interface ExpandedSections {
  expanded: ReadonlySet<string>;
  setExpanded: (key: string, open: boolean) => void;
}

function keysOfSectionsHoldingCurrent(
  destinations: readonly NavigationDrawerDestination[],
): string[] {
  for (const destination of destinations) {
    const nested = destination.children;
    if (nested === undefined || nested.length === 0) continue;
    if (nested.some((child) => child.current === true)) return [destinationKey(destination)];
    const inner = keysOfSectionsHoldingCurrent(nested);
    if (inner.length > 0) return [destinationKey(destination), ...inner];
  }
  return [];
}

const unionInOrder = (keys: readonly string[], more: readonly string[]) => [
  ...new Set([...keys, ...more]),
];

export function useExpandedSections(
  destinations: readonly NavigationDrawerDestination[],
  expanded: readonly string[] | undefined,
  defaultExpanded: readonly string[],
  onExpandedChange: ((expanded: string[]) => void) | undefined,
): ExpandedSections {
  const path = keysOfSectionsHoldingCurrent(destinations);
  const pathKey = JSON.stringify(path);
  const [shown, change, keepOwn] = useControllableState<readonly string[], string[]>({
    value: expanded,
    defaultValue: unionInOrder(defaultExpanded, path),
    onChange: onExpandedChange,
  });
  const controlled = expanded !== undefined;
  const [ownPath, setOwnPath] = useState(pathKey);
  const currentMovedWithinOwnState = !controlled && ownPath !== pathKey;
  if (currentMovedWithinOwnState) {
    setOwnPath(pathKey);
    keepOwn(unionInOrder(shown, path));
  }
  const latest = useLatest(shown);
  useEffect(
    function openApplicationsSectionsHoldingCurrent() {
      if (!controlled) return;
      const keys = JSON.parse(pathKey) as string[];
      if (keys.some((key) => !latest.current.includes(key)))
        change(unionInOrder(latest.current, keys));
    },
    [latest, change, controlled, pathKey],
  );
  const set = useMemo(() => new Set(shown), [shown]);
  const setExpanded = useCallback(
    (key: string, open: boolean) => {
      const current = latest.current;
      change(open ? unionInOrder(current, [key]) : current.filter((each) => each !== key));
    },
    [latest, change],
  );
  return { expanded: set, setExpanded };
}
