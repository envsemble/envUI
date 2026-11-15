import { useRef, useState, type RefObject } from 'react';
import { useFiguresMounted } from '../loading/useFiguresMounted';
import { useNear } from './useNear';

export function useSubjectShown(place?: RefObject<HTMLElement | null>) {
  const hydrated = useFiguresMounted();
  const [prerendered] = useState(!hydrated);
  const noPlace = useRef<HTMLElement>(null);
  const near = useNear(place ?? noPlace);
  return hydrated && (!prerendered || !place || near);
}
