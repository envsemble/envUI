import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';
import { codeThemeStyle } from './internal/CodeThemes.js';

export interface CodeProps extends ComponentPropsWithRef<'code'> {
  /**
   * dark (default) uses GitHub Dark in both app themes. subtle follows the theme with a quiet chip,
   * for prose dense with identifiers, paths and hashes.
   */
  appearance?: 'dark' | 'subtle';
}

/** Inline source; use CodeBlock for multiline source. */
export function Code({ appearance = 'dark', className, style, ...props }: CodeProps) {
  return (
    <code
      {...props}
      className={classNames('env-code', appearance === 'subtle' && 'env-code-subtle', className)}
      style={appearance === 'subtle' ? style : { ...codeThemeStyle(), ...style }}
    />
  );
}
