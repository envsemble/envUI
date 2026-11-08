'use client';

import { Popover as BasePopover } from '@base-ui/react/popover';
import { type ReactNode, type RefObject } from 'react';
import { classNames } from '../../internal/classNames.js';
import { type Direction } from '../../internal/provider/EnvUIContext.js';
import { PopupSurface } from '../../internal/popup/PopupSurface.js';
import { Grid, Row } from '../../layout/Layout.js';
import '../../styles/Base.css';
import '../../styles/PickerPopup.css';

const popupParts = {
  Portal: BasePopover.Portal,
  Positioner: BasePopover.Positioner,
  Popup: BasePopover.Popup,
};

/** The accessible name of a picker's field, which its popup and the list in it take too. */
export interface PickerName {
  'aria-labelledby': string | undefined;
  'aria-label': string | undefined;
}

export interface PickerPopupProps {
  /** The picker's own popup class, such as env-time-picker-popup, beside the shared ones. */
  className?: string;
  /** The field's control box, which the popup opens under, 8 px clear as every popup is. */
  anchorRef: RefObject<HTMLElement | null>;
  /** The popup element. */
  popupRef: RefObject<HTMLDivElement | null>;
  /** The text direction at the field, which the portal leaves behind. */
  dir: Direction | undefined;
  /** The popup's accessible name, the field's. */
  name: PickerName;
  /** The element focus moves to as the popup opens, from the popup. */
  initialFocus: (popup: HTMLElement | null) => HTMLElement | null;
  /** The footer's action at its start, such as Today or Now. */
  start: ReactNode;
  /** The footer's actions at its end, such as Clear; none where they are left out. */
  end?: ReactNode;
  /** The picker's content: a calendar, a time's wheels or a year of months. */
  children: ReactNode;
}

/**
 * The card DatePicker, TimePicker and MonthPicker open: the shared popup surface under the field,
 * at the start of it, with one inset, gap and size of controls, the picker's content in its body
 * and its actions in a footer, the shortcut at the start and Clear at the end. The popup keeps
 * DatePicker's class as each picker's popup did, beside the picker's own.
 */
export function PickerPopup({
  className,
  anchorRef,
  popupRef,
  dir,
  name,
  initialFocus,
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
      dir={dir}
      className={classNames('env-picker-popup', 'env-date-picker-popup', className)}
      layout={<Grid gap={3} padding={4} />}
      popupProps={{ ref: popupRef, ...name }}
      initialFocus={() => initialFocus(popupRef.current) ?? true}
    >
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
