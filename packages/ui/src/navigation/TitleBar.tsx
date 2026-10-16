import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';

export interface TitleBarProps extends Omit<ComponentPropsWithRef<'header'>, 'children'> {
  /** Content at the inline start, such as the application mark and a Menubar. */
  start?: ReactNode;
  /** Content centered in the bar, such as the document title. */
  children?: ReactNode;
  /** Content at the inline end, such as actions; the window controls follow it. */
  end?: ReactNode;
}

/**
 * A window title bar without the application shell, for a start page or a simple window of an
 * installed web app or desktop shell that draws its own title bar. It looks like AppShell's title
 * bar: empty space drags the window, it leaves room for the window controls the system draws, and
 * controls inside are small. It is a normal block; WindowFrame puts it above content that
 * scrolls on its own.
 */
export function TitleBar({ start, end, children, className, ...props }: TitleBarProps) {
  return (
    <header {...props} className={classNames('env-title-bar', 'env-title-bar-layout', className)}>
      <div className="env-title-bar-start">{start}</div>
      <div className="env-title-bar-center">{children}</div>
      <div className="env-title-bar-end">{end}</div>
    </header>
  );
}
