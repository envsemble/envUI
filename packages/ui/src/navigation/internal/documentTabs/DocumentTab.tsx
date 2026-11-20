'use client';

import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { useRef, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react';
import { IconButton } from '../../../actions/Button.js';
import { IconClose } from '../../../icons/Close.js';
import { classNames } from '../../../internal/classNames.js';
import { DecorativeIcon } from '../../../internal/icon/DecorativeIcon.js';
import { Slot } from '../../../internal/layout/Slot.js';
import { flag } from '../../../internal/flag.js';
import type { DocumentTabsItem, DocumentTabsProps } from '../../DocumentTabs.js';
import { useLabelText } from '../labelText.js';
import '../../../styles/Base.css';
import '../../../styles/DocumentTabs.css';

function closesTab(event: KeyboardEvent<HTMLElement>) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return false;
  if (event.key !== 'Delete' && event.key !== 'Backspace') return false;
  event.preventDefault();
  const heldKeyRepeat = event.repeat;
  return !heldKeyRepeat;
}

const middleButton = 1;

const preventMiddlePressAutoscroll = (event: MouseEvent<HTMLDivElement>) => {
  if (event.button === middleButton) event.preventDefault();
};

export function DocumentTab({
  id,
  item,
  active,
  focusable,
  panelId,
  closeName,
  moving,
  drop,
  onPointerDown,
  onClose,
  onPin,
}: Pick<DocumentTabsProps, 'panelId' | 'onClose' | 'onPin'> & {
  id: string;
  item: DocumentTabsItem;
  active: boolean;
  focusable: boolean;
  closeName: (label: string) => string;
  moving: boolean;
  drop: 'before' | 'after' | undefined;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
}) {
  const closable = item.closable !== false;
  const labelElement = useRef<HTMLSpanElement>(null);
  const name = useLabelText(item.label, item.textValue, labelElement);
  const {
    className,
    onPointerDown: ownPointerDown,
    onMouseDown: ownMouseDown,
    onAuxClick: ownAuxClick,
    ...itemProps
  } = item.itemProps ?? {};
  return (
    <div
      {...itemProps}
      className={classNames('env-document-tabs-item', className)}
      data-active={flag(active)}
      data-moving={moving ? 'pointer' : undefined}
      data-drop={drop}
      onPointerDown={(event) => {
        ownPointerDown?.(event);
        if (!event.defaultPrevented) onPointerDown(event);
      }}
      onMouseDown={(event) => {
        ownMouseDown?.(event);
        preventMiddlePressAutoscroll(event);
      }}
      onAuxClick={(event) => {
        ownAuxClick?.(event);
        if (event.button !== middleButton || event.defaultPrevented) return;
        event.preventDefault();
        if (closable) onClose(item.value);
      }}
    >
      <BaseTabs.Tab
        id={id}
        value={item.value}
        className="env-document-tabs-tab"
        aria-label={name}
        aria-controls={active ? panelId : undefined}
        aria-keyshortcuts={closable ? 'Delete Backspace' : undefined}
        title={item.tooltip ?? name}
        tabIndex={focusable ? 0 : -1}
        data-value={item.value}
        data-preview={flag(item.preview)}
        onDoubleClick={() => onPin?.(item.value)}
        onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
          if (closable && closesTab(event)) onClose(item.value);
        }}
      >
        {item.icon != null && <DecorativeIcon>{item.icon}</DecorativeIcon>}
        <span className="env-document-tabs-tab-label" ref={labelElement}>
          {item.label}
        </span>
        {item.end != null && (
          <Slot className="env-document-tabs-tab-end" element="span" layout="row" shrink="never">
            {item.end}
          </Slot>
        )}
      </BaseTabs.Tab>
      {closable && (
        <IconButton
          variant="ghost"
          icon={<IconClose />}
          aria-label={closeName(name)}
          aria-hidden
          tabIndex={-1}
          title={closeName(name)}
          className="env-document-tabs-close"
          onClick={() => onClose(item.value)}
        />
      )}
    </div>
  );
}
