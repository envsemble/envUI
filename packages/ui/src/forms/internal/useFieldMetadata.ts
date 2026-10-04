import { useId, type AriaAttributes, type ReactNode } from 'react';

/** Keep accessible field metadata identical across native and composed controls. */
export function useFieldMetadata(
  suppliedId: string | undefined,
  hint: ReactNode,
  error: ReactNode,
  describedBy: string | undefined,
  invalid: AriaAttributes['aria-invalid'],
) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  return {
    id,
    'aria-describedby':
      [
        describedBy,
        hint != null ? `${id}-hint` : undefined,
        error != null ? `${id}-error` : undefined,
      ]
        .filter(Boolean)
        .join(' ') || undefined,
    'aria-invalid': error != null ? true : invalid,
  };
}
