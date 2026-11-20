import type { ReactNode } from 'react';
import type { ControlSize } from '../control/controlTypes.js';

export interface FieldProps {
  /**
   * The field's visible name, above the field, such as Project name; it also names the control for
   * assistive technology.
   */
  label?: ReactNode;
  /**
   * Lasting guidance under the field, such as a format or a limit, linked to the control as its
   * description.
   */
  description?: ReactNode;
  /**
   * A message under the field that says how to correct the value. While it is set, the control is
   * invalid (aria-invalid) and the message joins its description, after the description.
   */
  error?: ReactNode;
}

/** A field's look. */
export type FieldVariant = 'outline' | 'ghost';

export interface FieldAppearanceProps {
  /**
   * The field's look: outline, a box with a thin edge, or ghost, a faint fill without an edge, for a
   * search at the top of a sidebar or a list.
   * @default 'outline'
   */
  variant?: FieldVariant;
}

export interface FieldSizeProps {
  /** The control height, sm, md or lg; without it, the container's, and else md. */
  size?: ControlSize;
}

export interface FieldDecorationProps {
  /** A decorative icon at the start of the field, such as Search or Mail. */
  startIcon?: ReactNode;
  /**
   * A control at the end of the field, such as an IconButton that reveals or copies the value; name
   * it with aria-label. A button that sets no variant takes ghost here.
   */
  endAction?: ReactNode;
  /**
   * The label shows above the field. false hides it, for a field whose purpose is clear without it,
   * such as a search in a toolbar: the label still names the field for assistive technology, and a
   * placeholder gives the visible guidance.
   * @default true
   */
  visibleLabel?: boolean;
}

export interface FieldAffixProps {
  /**
   * Short, non-interactive content before the value: text, such as the start of an address, or any
   * content, such as a currency's flag beside its code, or a small Avatar, at its own size. It is cut
   * short with an ellipsis where it is long, is not part of the value, and its text is read after
   * the label.
   */
  prefix?: ReactNode;
  /**
   * Short, non-interactive content after the value: text, such as a unit, or any content, such as
   * an icon beside the unit. It is cut short with an ellipsis where it is long, is not part of the
   * value, and its text is read after the label.
   */
  suffix?: ReactNode;
}
