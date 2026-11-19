'use client';

import { Popover as BasePopover } from '@base-ui/react/popover';
import { type ReactNode, type RefObject } from 'react';
import { classNames } from '../../internal/classNames.js';
import { type Direction } from '../../internal/provider/EnvUIContext.js';
import { PopupSurface } from '../../internal/popup/PopupSurface.js';
import { Grid, Row } from '../../layout/Layout.js';
import { Slot } from '../../internal/layout/Slot.js';
import '../../styles/Base.css';
import '../../styles/PickerPopup.css';

const popupParts = {
  Portal: BasePopover.Portal,
  Positioner: BasePopover.Positioner,
  Popup: BasePopover.Popup,
};

export interface PickerName {
  'aria-labelledby': string | undefined;
  'aria-label': string | undefined;
}

export interface PickerPopupProps {
  className?: string;
  anchorRef: RefObject<HTMLElement | null>;
  popupRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLElement | null>;
  dir: Direction | undefined;
  name: PickerName;
  initialFocus: (popup: HTMLElement | null) => HTMLElement | null;
  header?: ReactNode;
  start: ReactNode;
  end?: ReactNode;
  children: ReactNode;
}

export function PickerPopup({
  className,
  anchorRef,
  popupRef,
  triggerRef,
  dir,
  name,
  initialFocus,
  header,
  start,
  end,
  children,
}: PickerPopupProps) {
  return (
    <PopupSurface
      parts={popupParts}
      side="bottom"
      align="start"
      anchor={anchorRef}
      trigger={triggerRef}
      dir={dir}
      className={classNames('env-picker-popup', 'env-date-picker-popup', className)}
      layout={<Grid gap={3} padding={4} />}
      popupProps={{ ref: popupRef, ...name }}
      initialFocus={() => initialFocus(popupRef.current) ?? true}
    >
      {header != null && <Slot className="env-picker-popup-header">{header}</Slot>}
      <Grid className="env-picker-popup-body">{children}</Grid>
      <Row wrap align="center" gap={2} className="env-picker-popup-footer env-date-picker-actions">
        {start}
        {end ? (
          <Row
            render={<span />}
            wrap
            align="center"
            justify="end"
            gap={2}
            className="env-picker-popup-footer-end env-date-picker-actions-end"
          >
            {end}
          </Row>
        ) : null}
      </Row>
    </PopupSurface>
  );
}
