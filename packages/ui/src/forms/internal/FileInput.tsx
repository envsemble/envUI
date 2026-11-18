'use client';

import type { ComponentPropsWithRef } from 'react';

export interface FileInputProps extends Omit<
  ComponentPropsWithRef<'input'>,
  'type' | 'onChange' | 'value' | 'hidden'
> {
  onFiles?: (files: File[]) => void;
}

function letSameFileBeChosenAgain(input: HTMLInputElement) {
  input.value = '';
}

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
        letSameFileBeChosenAgain(element);
        if (chosen.length > 0) onFiles?.(chosen);
      }}
    />
  );
}
