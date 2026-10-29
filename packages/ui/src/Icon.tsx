import type { SVGProps } from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
  /** Accessible name for a meaningful standalone icon. Omit for decoration. */
  label?: string;
}

export interface SymbolIconProps extends Omit<IconProps, 'children'> {
  /** Select fill=1 geometry outside selection controls; navigation and tabs own their icon fill. */
  filled?: boolean;
}

/** Shared SVG defaults; custom icons may supply their own viewBox and children. */
export function Icon({ label, children, ...props }: IconProps) {
  const accessible = Boolean(label || props['aria-label'] || props['aria-labelledby']);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      focusable="false"
      aria-hidden={accessible ? undefined : true}
      role={accessible ? 'img' : undefined}
      aria-label={label}
      {...props}
    >
      {children}
    </svg>
  );
}
