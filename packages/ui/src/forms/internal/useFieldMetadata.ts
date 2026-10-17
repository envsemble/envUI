'use client';

import { useId, type AriaAttributes, type ReactNode } from 'react';

/** The ids of a field's description and error, which its control names in aria-describedby. */
export function fieldMessageIds(id: string) {
  return { description: `${id}-description`, error: `${id}-error` };
}

/**
 * The id and the accessible description and invalid state of a field's control, the same for native
 * and composed controls: its description, then its error, after the application's own
 * aria-describedby.
 */
export function useFieldMetadata(
  suppliedId: string | undefined,
  description: ReactNode,
  error: ReactNode,
  describedBy: string | undefined,
  invalid: AriaAttributes['aria-invalid'],
) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const ids = fieldMessageIds(id);
  return {
    id,
    'aria-describedby':
      [
        describedBy,
        description != null ? ids.description : undefined,
        error != null ? ids.error : undefined,
      ]
        .filter(Boolean)
        .join(' ') || undefined,
    'aria-invalid': error != null ? true : invalid,
  };
}
