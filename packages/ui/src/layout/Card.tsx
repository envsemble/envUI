import type {
  ComponentPropsWithRef,
  CSSProperties,
  MouseEventHandler,
  ReactElement,
  ReactNode,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { Text } from '../foundations/Text.js';
import { Column, Row, type SpaceStep } from './Layout.js';
import { Surface } from './Surface.js';
import { Slot } from '../internal/layout/Slot.js';
import { ActionElement } from '../internal/control/ActionElement.js';
import { given, type SkeletonProps } from '../internal/skeleton.js';
import type { HeadingLevel } from '../foundations/headingLevel.js';
import { flag } from '../internal/flag.js';
import { rendersContent } from '../internal/react/rendersContent.js';
import '../styles/Base.css';
import '../styles/Card.css';

/**
 * A card's fill: muted, the standalone card fill; default, a quieter fill that groups content, as a
 * pane's; or page, the page's own color.
 */
export type CardBackground = 'muted' | 'default' | 'page';

interface CardSurfaceProps extends SkeletonProps {
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
  /** The card's class, beside env-card. */
  className?: string;
  /** Styles of the card. */
  style?: CSSProperties;
}

/** What only a content card takes; an interactive card is one link or button. */
interface CardContentOptions {
  /**
   * The card's title at the top: an `h3` in the title type. headingLevel sets another level. Given
   * as undefined, such as over a placeholder item, a skeleton shows a bar in its place.
   */
  title?: ReactNode;
  /**
   * The title's heading level, for the page's outline; the type stays the title type.
   * @default 3
   */
  headingLevel?: HeadingLevel;
  /** A short fact at the end of the title row, such as when the card was updated. */
  meta?: ReactNode;
  /**
   * Content at the end of the title row, after the meta, such as an overflow Menu or an Edit
   * Button, placed as given.
   */
  headerEnd?: ReactNode;
  /** A sentence under the title, in muted text. */
  description?: ReactNode;
  /**
   * The card's controls, such as Buttons, in a strip along the bottom of the card, at its end and
   * wrapping onto more lines where they don't fit. For controls beside the title, use headerEnd.
   */
  actions?: ReactNode;
  /**
   * The card opens something through a link or button inside, such as its title: it reacts to
   * hover, keyboard focus on that target and presses. Mark the link or button `data-row-target` to
   * stretch it over the card; the other links, buttons and fields in the card, such as an author's
   * link in the description or a Menu in headerEnd, stay clickable above it.
   * @default false
   */
  interactive?: boolean;
  /**
   * The element for the card's meaning, such as render={<article />} or render={<section />}. A
   * div by default.
   */
  render?: ReactElement;
}

type NoContentOptions = { [Key in keyof CardContentOptions]?: never };

/**
 * A content card: a div, or the element of render, with an optional title row and actions; with
 * interactive, a link or button inside marked data-row-target takes the card's click.
 */
export type CardContentProps = CardSurfaceProps &
  CardContentOptions &
  Omit<ComponentPropsWithRef<'div'>, keyof CardSurfaceProps | 'title' | 'onClick'> & {
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
     * @default false
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
 * button card holds its content alone: no title or actions. A content card that opens one place
 * and keeps a title, meta and actions takes interactive and a data-row-target link instead.
 */
export type CardProps = CardContentProps | CardLinkProps | CardButtonProps;

/**
 * A rounded surface that groups content about one subject: a content card with an optional
 * title row and actions, or one link or button.
 */
export function Card(props: CardProps) {
  if (props.href !== undefined || props.onClick !== undefined)
    return <InteractiveCard {...props} />;
  return <ContentCard {...props} />;
}

function InteractiveCard({
  background = 'muted',
  padding,
  skeleton,
  className,
  style,
  children,
  ...props
}: CardLinkProps | CardButtonProps) {
  return (
    <Surface
      background={background}
      padding={padding}
      skeleton={skeleton}
      render={
        <Column
          gap={4}
          render={<ActionElement {...props} />}
          className={classNames('env-card', className)}
          style={style}
          data-interactive=""
        />
      }
    >
      {children}
    </Surface>
  );
}

function ContentCard(allProps: CardContentProps) {
  const slots = {
    title: given(allProps, 'title'),
    meta: given(allProps, 'meta'),
    description: given(allProps, 'description'),
  };
  return <ContentCardLayout {...allProps} slots={slots} />;
}

function ContentCardLayout({
  slots,
  background = 'muted',
  padding,
  skeleton,
  title,
  headingLevel,
  meta,
  headerEnd,
  description,
  actions,
  interactive = false,
  render,
  className,
  style,
  children,
  ...props
}: CardContentProps & { slots: Record<'title' | 'meta' | 'description', boolean> }) {
  const hasTitle = title != null || slots.title;
  const hasMeta = meta != null || slots.meta;
  const hasEnd = headerEnd != null;
  const hasActions = rendersContent(actions);
  const level = headingLevel ?? 3;
  const Heading = `h${level}` as const;
  const headingText = hasTitle && (
    <Text render={<Heading />} variant="title" className="env-card-title">
      {title}
    </Text>
  );
  const header = (hasTitle || hasMeta || hasEnd) && (
    <Row wrap align="center" gap={3} className="env-card-header">
      {headingText}
      {hasMeta && (
        <Text render={<span />} variant="body-sm" className="env-card-meta">
          {meta}
        </Text>
      )}
      {hasEnd && (
        <Slot className="env-card-header-end" layout="row" shrink="never">
          {headerEnd}
        </Slot>
      )}
    </Row>
  );
  const descriptionText = (description != null || slots.description) && (
    <Text render={<div />} variant="body" emphasis="muted" className="env-card-description">
      {description}
    </Text>
  );
  let content: ReactNode;
  if (hasActions) {
    content = (
      <>
        <Column gap={4} className="env-card-body">
          {header}
          {descriptionText}
          {children}
        </Column>
        <footer className="env-card-footer">
          <Slot className="env-card-actions" layout="row">
            {actions}
          </Slot>
        </footer>
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
      skeleton={skeleton}
      render={
        <Column
          {...props}
          render={render}
          gap={hasActions ? 0 : 4}
          className={classNames('env-card', className)}
          style={style}
          data-actions={flag(hasActions)}
          data-interactive={flag(interactive)}
        />
      }
    >
      {content}
    </Surface>
  );
}
