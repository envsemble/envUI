import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';
import '../styles/Base.css';
import '../styles/Code.css';

export type CodeProps = ComponentPropsWithRef<'code'>;

/**
 * Inline source in the code theme of the app theme, the nearest Theme boundary's; use CodeBlock for
 * multiline source.
 */
export function Code({ className, ...props }: CodeProps) {
  return <code {...props} className={classNames('env-code', className)} />;
}
