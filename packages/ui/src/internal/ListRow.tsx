import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { classNames } from './classNames.js';
import { DecorativeIcon } from './DecorativeIcon.js';
import { flag } from './flag.js';
import '../styles/Base.css';
import '../styles/ListRow.css';

export interface ListRowProps {
  /**
   * The row's element, which gives it its role and behavior: a Base UI item, such as
   * <BaseSelect.Item value={…} />, <BaseMenu.Item />, <BaseMenu.RadioItem value={…} /> or
   * <BaseCombobox.Item value={…} />, or an option element of a listbox. ListRow fills it with the
   * row's anatomy and the env-list-row class; its state shows through Base UI's data-highlighted,
   * data-selected and data-disabled.
   */
  render: ReactElement;
  /** The check mark or radio dot slot at the start, such as a Base UI ItemIndicator. */
  indicator?: ReactNode;
  /** A decorative icon before the label. */
  icon?: ReactNode;
  /** The row's text, which names it. */
  label: ReactNode;
  /** A second line under the label. */
  description?: ReactNode;
  /** Content at the end, such as a count or a submenu's chevron. */
  end?: ReactNode;
  /** A keyboard shortcut at the end, such as Ctrl+P. */
  shortcut?: ReactNode;
  /** A class of the owner's, such as env-select-item, beside env-list-row. */
  className?: string;
}

/**
 * The one anatomy of a row in a popup list: an indicator, an icon, a label with a description
 * under it, and content or a shortcut at the end, on the element of the list's own item, so the
 * owner keeps its roles and keyboard handling. Select, Combobox, Menu and the command palette's
 * options share it.
 */
export function ListRow({
  render,
  indicator,
  icon,
  label,
  description,
  end,
  shortcut,
  className,
}: ListRowProps) {
  const own = isValidElement(render) ? (render.props as { className?: string }) : {};
  const children = (
    <>
      {indicator != null && <span className="env-list-row-indicator">{indicator}</span>}
      {icon != null && (
        <span className="env-list-row-icon">
          <DecorativeIcon>{icon}</DecorativeIcon>
        </span>
      )}
      <span className="env-list-row-text">
        <span className="env-list-row-label">{label}</span>
        {description != null && <span className="env-list-row-description">{description}</span>}
      </span>
      {end != null && <span className="env-list-row-end">{end}</span>}
      {shortcut != null && <span className="env-list-row-shortcut">{shortcut}</span>}
    </>
  );
  return cloneElement(
    render as ReactElement<{ className?: string; children?: ReactNode }>,
    {
      className: classNames('env-list-row', className, own.className),
      'data-indicator': flag(indicator != null),
      children,
    } as { className: string; children: ReactNode },
  );
}
