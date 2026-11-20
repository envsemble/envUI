'use client';

import { useId, type AriaAttributes, type ReactNode } from 'react';
import { useRowControlNaming } from './RowControl.js';

export function fieldPartIds(id: string) {
  return {
    label: `${id}-label`,
    description: `${id}-description`,
    error: `${id}-error`,
    prefix: `${id}-prefix`,
    suffix: `${id}-suffix`,
  };
}

export function fieldDescribedBy(
  id: string,
  describedBy: string | undefined,
  description: ReactNode,
  error: ReactNode,
) {
  const ids = fieldPartIds(id);
  return (
    [
      describedBy,
      description != null ? ids.description : undefined,
      error != null ? ids.error : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined
  );
}

export function useFieldControl({
  id: suppliedId,
  description,
  error,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  ...ownNaming
}: {
  id: string | undefined;
  label: ReactNode;
  description: ReactNode;
  error: ReactNode;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby': string | undefined;
  'aria-invalid': AriaAttributes['aria-invalid'];
}) {
  const naming = useRowControlNaming({ ...ownNaming, 'aria-describedby': describedBy });
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  return {
    ids: fieldPartIds(id),
    naming,
    metadata: {
      id,
      'aria-describedby': fieldDescribedBy(
        id,
        naming['aria-describedby'] ?? describedBy,
        description,
        error,
      ),
      'aria-invalid': error != null ? true : invalid,
    },
  };
}
