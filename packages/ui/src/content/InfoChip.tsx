import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';

export interface InfoChipProps extends ComponentPropsWithRef<'span'> {}

export function InfoChip({ className, ...props }: InfoChipProps) {
  return <span {...props} className={classNames('env-info-chip', className)} />;
}
