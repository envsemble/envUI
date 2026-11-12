import type { SVGProps } from 'react';

/** An icon's tone: the status colors' text grades, or neutral, the color of its text. */
export type IconTone = 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'done';

export interface IconProps extends SVGProps<SVGSVGElement> {
  /** Accessible name for a meaningful standalone icon. Omit for decoration. */
  label?: string;
  /**
   * The icon's color: a status tone's text color, `--env-color-fg-{tone}`, such as success for a
   * step that is done, or neutral, the color of the text around it.
   * @default 'neutral'
   */
  tone?: IconTone;
}

export interface SymbolIconProps extends Omit<IconProps, 'children'> {
  /** Select fill=1 geometry outside selection controls; navigation and tabs own their icon fill. */
  filled?: boolean;
}

/**
 * The SVG that envUI's symbols render: 1 em, `currentColor`, and hidden from assistive technology
 * unless labelled. An application's own icons and logos go in Graphic, as a file or an SVG
 * component inside it.
 */
export function Icon({ label, tone = 'neutral', style, children, ...props }: IconProps) {
  const accessible = Boolean(label || props['aria-label'] || props['aria-labelledby']);
  const toneStyle = tone === 'neutral' ? style : { color: `var(--env-color-fg-${tone})`, ...style };
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
      style={toneStyle}
      {...props}
    >
      {children}
    </svg>
  );
}
