'use client';

import type { ComponentType, ReactElement } from 'react';
import { IconButton } from '../../../actions/Button.js';
import { IconClose } from '../../../icons/Close.js';

export function DialogHeadingClose({
  Close,
  label,
  pending,
}: {
  Close: ComponentType<{ render: ReactElement }>;
  label: string;
  pending: boolean;
}) {
  return (
    <Close
      render={
        <IconButton variant="ghost" icon={<IconClose />} aria-label={label} disabled={pending} />
      }
    />
  );
}
