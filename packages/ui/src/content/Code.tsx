'use client';

import type { ComponentPropsWithRef } from 'react';
import { useTheme } from '../foundations/Theme.js';
import { classNames } from '../internal/classNames.js';
import { codeThemeStyle } from './internal/CodeThemes.js';

export type CodeProps = ComponentPropsWithRef<'code'>;

/** Inline source in the code theme of the app theme; use CodeBlock for multiline source. */
export function Code({ className, style, ...props }: CodeProps) {
  const theme = useTheme();
  return (
    <code
      {...props}
      className={classNames('env-code', className)}
      style={{ ...codeThemeStyle(theme), ...style }}
    />
  );
}
