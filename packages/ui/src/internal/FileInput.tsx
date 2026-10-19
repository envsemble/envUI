'use client';

import type { ComponentPropsWithRef } from 'react';

export interface FileInputProps
  extends Omit<ComponentPropsWithRef<'input'>, 'type' | 'onChange' | 'value' | 'hidden'> {
  /**
   * Receives the files chosen in the browser's file picker. The input then forgets them, so
   * choosing the same file again reports it again.
   */
  onFiles?: (files: File[]) => void;
}

/**
 * The hidden native file input behind a control that opens the browser's file picker, such as a
 * drop zone's browse button or an editor's attach button: open it with ref.current.click(). It is
 * out of the tab order and hidden from view; the visible control is the one people use.
 */
export function FileInput({ onFiles, ...props }: FileInputProps) {
  return (
    <input
      tabIndex={-1}
      {...props}
      type="file"
      hidden
      onChange={(event) => {
        const element = event.currentTarget;
        const chosen = Array.from(element.files ?? []);
        element.value = '';
        if (chosen.length > 0) onFiles?.(chosen);
      }}
    />
  );
}
