import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';

export interface CodeProps extends ComponentPropsWithRef<'code'> {}

/** Inline code follows the surrounding prose; use CodeBlock for multiline source. */
export function Code({ className, ...props }: CodeProps) {
  return <code {...props} className={classNames('env-code', className)} />;
}
