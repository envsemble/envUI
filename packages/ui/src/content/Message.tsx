import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { Grid, Row } from '../layout/Layout.js';
import { DecorativeIcon } from '../internal/icon/DecorativeIcon.js';
import { ControlDefaults } from '../internal/control/ControlDefaults.js';
import { Slot } from '../internal/layout/Slot.js';
import { Spinner } from '../feedback/Spinner.js';
import { IconError } from '../icons/Error.js';
import { MessageStatusLabel } from './internal/MessageStatusLabel.js';
import { MessageListFollow } from './internal/MessageListFollow.js';
import { inSkeleton, given, skeletonAttributes, type SkeletonProps } from '../internal/skeleton.js';
import { flag } from '../internal/flag.js';
import '../styles/Base.css';
import '../styles/Message.css';

export type MessageStatus = 'sending' | 'failed';

export interface MessageProps
  extends Omit<ComponentPropsWithRef<'article'>, 'children'>, SkeletonProps {
  /**
   * self: written by the person using the app, a compact bubble at the inline end. other: from
   * anyone else, such as an assistant or another participant, full-width content without a bubble.
   */
  from: 'self' | 'other';
  /**
   * Who wrote the message, such as a name, shown above it at weight 500, or content such as a link
   * to their profile with a Bot or Owner Badge. Leave it out where the conversation makes it
   * clear, such as on your own messages in a conversation with one person.
   */
  author?: ReactNode;
  /**
   * Content beside the message, at its inline start, placed as given, such as the author's Avatar
   * or an assistant's mark, in a column of its own beside the header and the content.
   */
  start?: ReactNode;
  /** Supporting facts beside the author, in the muted color, such as the time or a RelativeTime. */
  meta?: ReactNode;
  /**
   * Small actions below the message, such as Copy or Try again: buttons without a variant or size of
   * their own are small ghost buttons, at the inline end for your own messages. false and null
   * count as absent.
   */
  actions?: ReactNode;
  /**
   * A message on its way, sending, with a spinner and Sending; or one that could not be sent,
   * failed, with an error icon and Not sent in the danger tone and, on your own message, a red
   * outline around the bubble. Without it the message is sent.
   */
  status?: MessageStatus;
  /**
   * The content beside the status icon, such as "Could not deliver" or a sentence with a Try again
   * link. It overrides EnvUIProvider's `messages.message.sending` and `.failed`.
   * @default 'Sending' or 'Not sent'
   */
  statusLabel?: ReactNode;
  /**
   * The message. Plain text keeps its line breaks; formatted content, such as Markdown, fills the
   * width of a message from someone else.
   */
  children: ReactNode;
}

function present(node: ReactNode) {
  return node != null && node !== false;
}

/**
 * One entry of a conversation, such as a chat message or a comment, as an article: a compact
 * bubble at the inline end for your own messages, full-width content for others', with an
 * optional author, meta, status and actions.
 */
export function Message(allProps: MessageProps) {
  const {
    from,
    author,
    start,
    meta,
    actions,
    status,
    statusLabel,
    skeleton = false,
    className,
    style,
    children,
    ...props
  } = allProps;
  const hasAuthor = present(author) || given(allProps, 'author');
  const hasMeta = present(meta) || given(allProps, 'meta');
  const hasStart = present(start);
  const rowsBesideStart =
    Number(hasAuthor || hasMeta) + 1 + Number(status != null) + Number(present(actions));
  const styleWithRowsBesideStart: CSSProperties | undefined = hasStart
    ? { ...style, '--_message-rows': String(rowsBesideStart) }
    : style;
  return (
    <Grid
      gap={2}
      render={
        <article
          {...props}
          {...skeletonAttributes(skeleton)}
          className={classNames('env-message', className)}
          data-from={from}
          data-status={status}
          data-start={flag(hasStart)}
          style={styleWithRowsBesideStart}
        />
      }
    >
      {inSkeleton(
        skeleton,
        <>
          {hasStart && <Slot className="env-message-start">{start}</Slot>}
          {(hasAuthor || hasMeta) && (
            <Row render={<header />} wrap className="env-message-header">
              {hasAuthor && (
                <Slot className="env-message-author" element="span">
                  {author}
                </Slot>
              )}
              {hasMeta && (
                <Slot className="env-message-meta" element="span">
                  {meta}
                </Slot>
              )}
            </Row>
          )}
          <Slot className="env-message-content">
            {typeof children === 'string' ? (
              <span className="env-message-text">{children}</span>
            ) : (
              children
            )}
          </Slot>
          {status != null && (
            <Row align="center" gap={1} className="env-message-status">
              {status === 'sending' ? (
                <Spinner size="sm" />
              ) : (
                <DecorativeIcon>
                  <IconError />
                </DecorativeIcon>
              )}
              <MessageStatusLabel status={status} label={statusLabel} />
            </Row>
          )}
          {present(actions) && (
            <Slot className="env-message-actions" layout="row">
              <ControlDefaults variant="ghost" size="sm">
                {actions}
              </ControlDefaults>
            </Slot>
          )}
        </>,
      )}
    </Grid>
  );
}

export interface MessageListProps extends ComponentPropsWithRef<'div'> {
  /**
   * A reply is on its way or streaming in: after the last message, where the reply will show, a
   * row with the busy author, a quiet spinner and Working in the muted color; and the log reports
   * aria-busy, so assistive technology can wait for the reply to finish instead of announcing
   * every step.
   */
  busy?: boolean;
  /**
   * Who the reply on its way comes from, such as Agent or the agent's name with its Avatar, named
   * on the busy row as a message's author.
   */
  busyAuthor?: ReactNode;
  /**
   * The content beside the busy spinner, such as "Thinking" or the current step, Running tests….
   * It overrides EnvUIProvider's `messages.message.working`. The busy row is hidden from
   * assistive technology, which hears aria-busy on the log instead.
   * @default 'Working'
   */
  busyLabel?: ReactNode;
  /**
   * The list scrolls by itself and follows the conversation: it fills the height its container
   * gives it, opens at the latest message and keeps the latest in view while the reader is at the
   * end. Once they scroll away and more arrives, a Jump to latest button shows at its foot, which
   * scrolls back to the end.
   * @default false
   */
  follow?: boolean;
  /**
   * The text of the Jump to latest button of a list that follows. It overrides EnvUIProvider's
   * `messages.message.jumpToLatest`.
   * @default 'Jump to latest'
   */
  jumpToLatestLabel?: string;
}

/**
 * The messages of a conversation in order, as a log: assistive technology politely announces
 * messages added anywhere in it and text that changes. Set busy while a reply is on its way or
 * streams in, and follow where the list scrolls by itself. Name it with aria-label or
 * aria-labelledby.
 */
export function MessageList({
  busy = false,
  busyAuthor,
  busyLabel,
  follow = false,
  jumpToLatestLabel,
  className,
  children,
  ...props
}: MessageListProps) {
  return (
    <Grid
      gap={5}
      aria-live="polite"
      aria-busy={busy || undefined}
      tabIndex={follow ? 0 : undefined}
      {...props}
      role="log"
      className={classNames('env-message-list', className)}
      data-follow={flag(follow)}
    >
      {children}
      {busy && (
        <Row wrap align="center" className="env-message-list-busy" aria-hidden="true">
          {present(busyAuthor) && (
            <Slot className="env-message-author" element="span">
              {busyAuthor}
            </Slot>
          )}
          <Row align="center" gap={1} className="env-message-status">
            <Spinner size="sm" />
            <MessageStatusLabel status="working" label={busyLabel} />
          </Row>
        </Row>
      )}
      {follow && <MessageListFollow label={jumpToLatestLabel} />}
    </Grid>
  );
}
