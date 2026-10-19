'use client';

import { Field as BaseField } from '@base-ui/react/field';
import { createContext, useContext, type ComponentProps, type ReactNode } from 'react';
import { Error as ErrorIcon } from '../icons/Error.js';
import { classNames } from '../internal/classNames.js';
import { withDisplayName } from '../internal/withDisplayName.js';
import type { ControlSize } from '../foundations/Theme.js';

type ClassName = { className?: string };

/** Whether Field.Root was given invalid, which shows its error as Base UI's own failures do. */
const InvalidContext = createContext(false);

export type RootProps = Omit<ComponentProps<typeof BaseField.Root>, 'className'> & ClassName;

/**
 * A labelled form control with its description and error, for a control envUI has no field for,
 * such as a control of the application's own: Field.Label names Field.Control, and the
 * description and the error describe it, with ids, aria-invalid and the disabled state wired
 * through Base UI's Field.
 */
function Root({ className, invalid, children, ...props }: RootProps) {
  return (
    <BaseField.Root {...props} invalid={invalid} className={classNames('env-field', className)}>
      <InvalidContext value={invalid === true}>{children}</InvalidContext>
    </BaseField.Root>
  );
}

export type LabelProps = Omit<ComponentProps<typeof BaseField.Label>, 'className'> & ClassName;

/** The field's visible name; it names the control for assistive technology. */
function Label({ className, ...props }: LabelProps) {
  return <BaseField.Label {...props} className={classNames('env-field-label', className)} />;
}

export type ControlProps = Omit<ComponentProps<typeof BaseField.Control>, 'className' | 'size'> &
  ClassName & {
    /**
     * The height, as on every control: sm, md or lg in the current scale. Without it, the control
     * height of the container.
     */
    size?: ControlSize;
  };

/**
 * The control: a native text input in the outlined field look by default, or any control through
 * render, such as render={<MyControl />}, which receives the control's props, id and ref. A custom
 * control styles itself; the class env-field-control gives it the field's outline.
 */
function Control({ className, size, ...props }: ControlProps) {
  return (
    <BaseField.Control
      {...props}
      className={classNames('env-field-control', className)}
      data-size={size}
    />
  );
}

export type DescriptionProps = Omit<ComponentProps<typeof BaseField.Description>, 'className'> &
  ClassName;

/**
 * Lasting guidance under the control, such as a format or a limit, linked to the control as its
 * description.
 */
function Description({ className, ...props }: DescriptionProps) {
  return (
    <BaseField.Description {...props} className={classNames('env-field-description', className)} />
  );
}

export type ErrorProps = Omit<ComponentProps<typeof BaseField.Error>, 'className' | 'children'> &
  ClassName & {
    /**
     * How to correct the value. Without children, the browser's validation message shows.
     */
    children?: ReactNode;
  };

/**
 * A message under the control that says how to correct the value, with an error icon. It shows
 * while the field is invalid, from its own validation or from invalid on Field.Root, and is linked
 * to the control; match="valueMissing" and the like show it for one kind of failure, and
 * match={true} always.
 */
function FieldError({ className, children, match, ...props }: ErrorProps) {
  const invalid = useContext(InvalidContext);
  return (
    <BaseField.Error
      {...props}
      match={match ?? (invalid || undefined)}
      {...(children != null && { children })}
      className={classNames('env-field-error', className)}
      // The message, the children or the browser's, follows the icon.
      render={({ children: message, ...errorProps }) => (
        <div {...errorProps}>
          <ErrorIcon aria-hidden="true" focusable="false" />
          <span>{message}</span>
        </div>
      )}
    />
  );
}

// Each part is named for React DevTools by a pure call, so a bundler drops the parts an
// application leaves unused.
const RootPart = /* @__PURE__ */ withDisplayName(Root, 'Field.Root');
const LabelPart = /* @__PURE__ */ withDisplayName(Label, 'Field.Label');
const ControlPart = /* @__PURE__ */ withDisplayName(Control, 'Field.Control');
const DescriptionPart = /* @__PURE__ */ withDisplayName(Description, 'Field.Description');
const ErrorPart = /* @__PURE__ */ withDisplayName(FieldError, 'Field.Error');
export {
  RootPart as Root,
  LabelPart as Label,
  ControlPart as Control,
  DescriptionPart as Description,
  ErrorPart as Error,
};
