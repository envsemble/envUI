import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react';
import { classNames } from '../classNames.js';
import { flag } from '../flag.js';
import { Slot } from '../layout/Slot.js';
import '../../styles/Base.css';
import '../../styles/ListRow.css';

export interface ListRowProps {
  /**
   * The row's element, which gives it its role and behavior: a Base UI item, such as
   * <BaseSelect.Item value={…} />, <BaseCombobox.Item value={…} /> or
   * <BaseAutocomplete.Item value={…} />, or an option element of a listbox. ListRow fills it with
   * the row's anatomy and the env-list-row class; its state shows through Base UI's
   * data-highlighted, data-selected and data-disabled.
   */
  render: ReactElement;
  /** The check mark or radio dot slot at the start, such as a Base UI ItemIndicator. */
  indicator?: ReactNode;
  /**
   * Content before the label, such as an icon or an Avatar: an envUI icon takes the icon size and
   * other content keeps its own. It is hidden from assistive technology, since the label names the
   * row.
   */
  start?: ReactNode;
  /** The row's name, in the row's text color; it wraps and is never cut short. */
  label: ReactNode;
  /** A second line under the label, in muted text. */
  description?: ReactNode;
  /** Content at the end, such as a count, keys or a submenu's chevron, which keeps its size. */
  end?: ReactNode;
  /** A class of the owner's, such as env-select-item, beside env-list-row. */
  className?: string;
  descriptionInName?: boolean;
}

/**
 * The one anatomy of a row in a popup list: an indicator, content before the label, a label with a
 * description under it, and content at the end, on the element of the list's own item, so the
 * owner keeps its roles and keyboard handling. Select's, Combobox's and the command palette's
 * options share it; Menu's items have an anatomy of their own.
 */
export function ListRow({
  render,
  indicator,
  start,
  label,
  description,
  end,
  className,
  descriptionInName = false,
}: ListRowProps) {
  const descriptionId = useId();
  const own = isValidElement(render) ? (render.props as { className?: string }) : {};
  const describes = description != null && !descriptionInName;
  const children = (
    <>
      {indicator != null && <span className="env-list-row-indicator">{indicator}</span>}
      {start != null && (
        <Slot className="env-list-row-start" element="span" layout="row" shrink="never" aria-hidden>
          {start}
        </Slot>
      )}
      <span className="env-list-row-text">
        <Slot className="env-list-row-label" element="span">
          {label}
        </Slot>
        {description != null && (
          <span className="env-list-row-description">
            {describes ? (
              <span id={descriptionId} aria-hidden="true">
                {description}
              </span>
            ) : (
              description
            )}
          </span>
        )}
      </span>
      {end != null && (
        <Slot className="env-list-row-end" element="span" layout="row" shrink="never">
          {end}
        </Slot>
      )}
    </>
  );
  return cloneElement(
    render as ReactElement<{ className?: string; children?: ReactNode }>,
    {
      className: classNames('env-list-row', className, own.className),
      'data-indicator': flag(indicator != null),
      ...(describes && { 'aria-describedby': descriptionId }),
      children,
    } as { className: string; children: ReactNode },
  );
}

export function shownLabelText(row: Element) {
  return row
    .querySelector(':scope > .env-list-row-text > .env-list-row-label')
    ?.textContent?.trim();
}
