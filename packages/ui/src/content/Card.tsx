import type {
  ComponentPropsWithRef,
  CSSProperties,
  MouseEventHandler,
  ReactElement,
  ReactNode,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { Text } from '../foundations/Text.js';
import { Stack, type SpaceStep } from '../foundations/Layout.js';
import { Surface } from '../foundations/Surface.js';
import { ActionElement, type ActionElementProps } from '../internal/ActionElement.js';

/**
 * A card's fill: muted, the standalone card fill; default, a quieter fill that groups content, as a
 * pane's; or page, the page's own color.
 */
export type CardBackground = 'muted' | 'default' | 'page';

/** The level of a card's heading, from h1 to h6. */
export type CardHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface CardSurfaceProps {
  /**
   * The fill: muted, the standalone card fill; default, a quieter fill that groups content, such as
   * a section of a settings page; or page, the page's own color, for a card inside a pane.
   * @default 'muted'
   */
  background?: CardBackground;
  /**
   * The inset on every side, as a step of the spacing scale, such as 6 for 2 rem; 0 removes it.
   * Without it, the inset follows the window's width.
   * @default 1.25 rem in narrow windows, growing to 1.5 rem from 50 rem wide
   */
  padding?: SpaceStep;
  className?: string;
  style?: CSSProperties;
}

/** What only a content card takes; an interactive card is one link or button. */
interface CardContentOptions {
  /**
   * A title at the top of the card: an `h3` in the title type, or in the feature layout an `h2` in
   * the headline type. headingLevel sets another level.
   */
  heading?: ReactNode;
  /**
   * The heading's level, for the page's outline; the type stays as the layout sets it.
   * @default 3, or 2 in the feature layout
   */
  headingLevel?: CardHeadingLevel;
  /** A short fact at the end of the heading row, such as when the card was updated. */
  meta?: ReactNode;
  /** A sentence under the heading, in muted text. */
  description?: ReactNode;
  /**
   * A decorative icon at the start of the feature layout, 1.5 rem in the muted color; hidden from
   * assistive technology.
   */
  icon?: ReactNode;
  /**
   * The card's controls, such as Buttons: in a strip along the bottom of the card, or in the feature
   * layout at its end, moving below the text and filling the card's width in a card narrower than
   * 38 rem.
   */
  actions?: ReactNode;
  /**
   * stack, content spaced 1 rem apart, with the actions in a strip along the bottom; or feature, an
   * icon at the start, the heading and description, and the actions at the end.
   * @default 'stack'
   */
  layout?: 'stack' | 'feature';
  /**
   * The element for the card's meaning, such as render={<article />} or render={<section />}. A
   * div by default.
   */
  render?: ReactElement;
}

type NoContentOptions = { [Key in keyof CardContentOptions]?: never };

/** A content card: a div, or the element of render, with an optional heading row and actions. */
export type CardContentProps = CardSurfaceProps &
  CardContentOptions &
  Omit<ComponentPropsWithRef<'div'>, keyof CardSurfaceProps | 'onClick'> & {
    href?: undefined;
    onClick?: undefined;
  };

/** A link card: the whole card is one native link, through the LinkProvider. */
export type CardLinkProps = CardSurfaceProps &
  NoContentOptions &
  Omit<ComponentPropsWithRef<'a'>, keyof CardSurfaceProps> & {
    /** The destination: the whole card is one native link, through the LinkProvider. */
    href: string;
    /**
     * A disabled link card has no destination, cannot be focused and reports aria-disabled; a
     * disabled button card cannot be pressed.
     */
    disabled?: boolean;
  };

/** A button card: the whole card is one native button that starts an action. */
export type CardButtonProps = CardSurfaceProps &
  NoContentOptions &
  Omit<ComponentPropsWithRef<'button'>, keyof CardSurfaceProps | 'onClick'> & {
    href?: undefined;
    /** Runs when the card is pressed: the whole card is one native button. */
    onClick: MouseEventHandler<HTMLButtonElement>;
  };

/**
 * A content card (the default), a link card with href, or a button card with onClick. A link or
 * button card holds its content alone: no heading, actions or layout.
 */
export type CardProps = CardContentProps | CardLinkProps | CardButtonProps;

/**
 * A rounded surface that groups content about one subject: a content card with an optional
 * heading row and actions, a feature card with an icon and an action, or one link or button.
 */
export function Card(props: CardProps) {
  if (props.href !== undefined || props.onClick !== undefined)
    return <InteractiveCard {...props} />;
  return <ContentCard {...props} />;
}

function InteractiveCard({
  background = 'muted',
  padding,
  className,
  style,
  children,
  ...props
}: CardLinkProps | CardButtonProps) {
  return (
    <Surface
      background={background}
      padding={padding}
      render={
        <Stack
          gap={4}
          render={<ActionElement {...(props as ActionElementProps)} />}
          className={classNames('env-card', className)}
          style={style}
          data-layout="stack"
          data-interactive=""
        />
      }
    >
      {children}
    </Surface>
  );
}

function ContentCard({
  background = 'muted',
  padding,
  heading,
  headingLevel,
  meta,
  description,
  icon,
  actions,
  layout = 'stack',
  render,
  className,
  style,
  children,
  ...props
}: CardContentProps) {
  const feature = layout === 'feature';
  const hasActions = actions != null && actions !== false;
  const level = headingLevel ?? (feature ? 2 : 3);
  const Heading = `h${level}` as const;
  const header = (heading != null || meta != null) && (
    <div className="env-card-header">
      {heading != null && (
        <Text
          render={<Heading />}
          variant={feature ? 'headline' : 'title'}
          className="env-card-heading"
        >
          {heading}
        </Text>
      )}
      {meta != null && (
        <Text render={<span />} variant="body-sm" className="env-card-meta">
          {meta}
        </Text>
      )}
    </div>
  );
  const descriptionText = description != null && (
    <Text
      variant={feature ? 'body-sm' : 'body'}
      emphasis={feature ? undefined : 'muted'}
      className="env-card-description"
    >
      {description}
    </Text>
  );
  let content: ReactNode;
  if (feature) {
    content = (
      <div className="env-card-layout">
        {icon != null && (
          <div className="env-card-icon">
            <DecorativeIcon>{icon}</DecorativeIcon>
          </div>
        )}
        <Stack className="env-card-body">
          {(header || descriptionText) && (
            <Stack gap={1}>
              {header}
              {descriptionText}
            </Stack>
          )}
          {children}
        </Stack>
        {hasActions && <div className="env-card-footer">{actions}</div>}
      </div>
    );
  } else if (hasActions) {
    content = (
      <>
        <Stack className="env-card-body">
          {header}
          {descriptionText}
          {children}
        </Stack>
        <Stack
          render={<footer />}
          direction="row"
          wrap
          align="center"
          justify="end"
          className="env-card-footer"
        >
          {actions}
        </Stack>
      </>
    );
  } else {
    content = (
      <>
        {header}
        {descriptionText}
        {children}
      </>
    );
  }
  return (
    <Surface
      background={background}
      padding={padding}
      render={
        <Stack
          {...props}
          render={render}
          gap={!feature && hasActions ? 0 : 4}
          className={classNames('env-card', className)}
          style={style}
          data-layout={layout}
          data-actions={hasActions ? '' : undefined}
        />
      }
    >
      {content}
    </Surface>
  );
}
