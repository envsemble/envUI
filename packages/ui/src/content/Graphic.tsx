import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import '../styles/Base.css';
import '../styles/Graphic.css';

/**
 * A graphic's size: `text`, the size of the text around it; `icon`, the icon size of the slot it
 * sits in; `sm`, `md`, `lg` and `xl`, Avatar's sizes; or `fill`, its container's box.
 */
export type GraphicSize = 'text' | 'icon' | 'sm' | 'md' | 'lg' | 'xl' | 'fill';

/** A graphic's colors: its own, or the text color around it. */
export type GraphicTint = 'own' | 'text';

interface GraphicBaseProps
  extends Omit<ComponentPropsWithRef<'span'>, 'children' | 'role' | 'aria-label' | 'aria-hidden'> {
  /**
   * What the picture says, such as the company's name for its logo: it names the graphic as an
   * image. `""` when the text beside it already says it, such as a logo before the name: the
   * graphic is decorative and hidden from assistive technology.
   */
  alt: string;
  /**
   * The box the picture is contained and centered in: `text` 1 em, in a line of text; `icon` the
   * icon size of the slot it sits in, such as a button's, else a control's 1 rem; `sm` 1.5 rem,
   * `md` 2 rem, `lg` 3 rem and `xl` 5.5 rem, Avatar's sizes; `fill` the whole of its container. Its
   * size never comes from the file.
   * @default 'icon'
   */
  size?: GraphicSize;
  /**
   * `own` keeps the picture's colors; `text` paints a one-color picture in the text color, so it
   * follows the theme and the state of the control it sits in. A file in the text color is drawn
   * through a CSS mask, which needs a file from another origin to be served with CORS.
   * @default 'own'
   */
  tint?: GraphicTint;
}

/** A graphic from a file. */
interface GraphicFileProps extends GraphicBaseProps {
  /**
   * The file's URL, such as an imported PNG, WebP, JPEG or SVG. While it is undefined, such as
   * before a chosen file is read, the box stays empty at its size.
   */
  src: string | undefined;
  children?: never;
}

/** A graphic from an SVG component. */
interface GraphicSvgProps extends GraphicBaseProps {
  src?: never;
  /** An SVG, such as the application's own icon component, with a viewBox. */
  children: ReactNode;
}

export type GraphicProps = GraphicFileProps | GraphicSvgProps;

/** The CSS url() of a file, quoted so any URL stays one value. */
function cssUrl(src: string) {
  return `url(${JSON.stringify(src)})`;
}

/**
 * An application's own logo, icon or picture, from a file or an SVG component, at one of envUI's
 * sizes: contained and centered in its box, never stretched, and never at the file's own size.
 */
export function Graphic({
  src,
  children,
  alt,
  size = 'icon',
  tint = 'own',
  className,
  ...props
}: GraphicProps) {
  let picture: ReactNode = children;
  if (src !== undefined)
    picture =
      tint === 'text' ? (
        <span className="env-graphic-mask" style={{ maskImage: cssUrl(src) }} />
      ) : (
        <img className="env-graphic-image" src={src} alt="" draggable={false} />
      );
  const named = alt !== '';
  return (
    <span
      {...props}
      className={classNames('env-graphic', className)}
      data-size={size}
      data-tint={tint === 'text' ? 'text' : undefined}
      role={named ? 'img' : undefined}
      aria-label={named ? alt : undefined}
      aria-hidden={named ? undefined : true}
    >
      {picture}
    </span>
  );
}
