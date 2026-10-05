import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';
import { codeThemeStyle } from './internal/CodeThemes.js';

export interface CodeProps extends ComponentPropsWithRef<'code'> {}

/** Inline source uses GitHub Dark in both app themes; use CodeBlock for multiline source. */
export function Code({ className, style, ...props }: CodeProps) {
  return (
    <code
      {...props}
      className={classNames('env-code', className)}
      style={{ ...codeThemeStyle(), ...style }}
    />
  );
}
