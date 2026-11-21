'use client';

import { Field as BaseField } from '@base-ui/react/field';
import { createContext, useContext, type ComponentProps, type ReactNode } from 'react';
import { IconError } from '../icons/Error.js';
import { classNames } from '../internal/classNames.js';
import { Grid, Row } from '../layout/Layout.js';
import { withDisplayName } from '../internal/react/withDisplayName.js';
import { renderElement } from '../internal/react/renderElement.js';
import type { ControlSize } from '../foundations/Theme.js';
import '../styles/Base.css';
import '../styles/Field.css';

type ClassName = {
  /** The part's class, beside its own env-field class. */
  className?: string;
};

const RootGivenInvalidContext = createContext(false);

export type RootProps = Omit<ComponentProps<typeof BaseField.Root>, 'className'> & ClassName;

/**
 * A labelled form control with its description and error, for a control envUI has no field for,
 * such as a control of the application's own: Field.Label names Field.Control, and the
 * description and the error describe it.
 */
function Root({ className, invalid, children, ...props }: RootProps) {
  return (
    <BaseField.Root
      render={<Grid gap={3} />}
      {...props}
      invalid={invalid}
      className={classNames('env-field', className)}
    >
      <RootGivenInvalidContext value={invalid === true}>{children}</RootGivenInvalidContext>
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
    /**
     * The icon before the message, decorative, so hide an icon of your own from assistive technology,
     * or null for none, such as for a compact error beside a control.
     * @default the error icon
     */
    icon?: ReactNode;
  };

/**
 * A message under the control that says how to correct the value, with an error icon. It shows
 * while the field is invalid, from its own validation or from invalid on Field.Root, and is linked
 * to the control; match="valueMissing" and the like show it for one kind of failure, and
 * match={true} always.
 */
function FieldError({ className, children, match, icon, render, ...props }: ErrorProps) {
  const invalid = useContext(RootGivenInvalidContext);
  return (
    <BaseField.Error
      {...props}
      match={match ?? (invalid || undefined)}
      {...(children != null && { children })}
      className={classNames('env-field-error', className)}
      render={({ children: message, ...errorProps }, state) => {
        const content = (
          <>
            {icon === undefined ? <IconError aria-hidden="true" focusable="false" /> : icon}
            <span>{message}</span>
          </>
        );
        if (typeof render === 'function')
          return render({ ...errorProps, children: content }, state);
        if (render) return renderElement('div', render, { ...errorProps, children: content });
        return (
          <Row align="start" gap={2} {...errorProps}>
            {content}
          </Row>
        );
      }}
    />
  );
}

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
