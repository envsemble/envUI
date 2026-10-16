import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { Spinner } from '../feedback/Spinner.js';
import { Error as ErrorIcon } from '../icons/Error.js';

export type MessageStatus = 'sending' | 'failed';

export interface MessageProps extends Omit<ComponentPropsWithRef<'article'>, 'children'> {
  /**
   * self: written by the person using the app, a compact bubble at the inline end. other: from
   * anyone else, such as an assistant or another participant, full-width content without a bubble.
   */
  from: 'self' | 'other';
  /**
   * Who wrote the message, such as a name, shown above it at weight 500. Leave it out where the
   * conversation makes it clear, such as on your own messages in a conversation with one person.
   */
  author?: ReactNode;
  /** Supporting facts beside the author, in the muted color, such as the time or a RelativeTime. */
  meta?: ReactNode;
  /**
   * Small actions below the message, such as Copy or Retry, at the 2 rem compact height, or the
   * touch height on touch screens; at the inline end for your own messages. A text IconButton at
   * the edge lines its icon up with the message. false and null count as absent.
   */
  actions?: ReactNode;
  /**
   * A message on its way, sending, with a spinner and Sending; or one that could not be sent,
   * failed, with an error icon and Not sent in the danger tone and, on your own message, a red
   * outline around the bubble. Without it the message is sent.
   */
  status?: MessageStatus;
  /**
   * The text beside the status icon, in the page's language, such as "Could not deliver".
   * @default 'Sending' or 'Not sent'
   */
  statusLabel?: string;
  /**
   * The message. Plain text keeps its line breaks; formatted content, such as Markdown, fills the
   * width of a message from someone else.
   */
  children: ReactNode;
}

/** Conditional content such as {failed && <Retry />} leaves false behind; it counts as absent. */
function present(node: ReactNode) {
  return node != null && node !== false;
}

const statusLabels: Record<MessageStatus, string> = {
  sending: 'Sending',
  failed: 'Not sent',
};

/**
 * One entry of a conversation, such as a chat message or a comment, as an article: a compact
 * bubble at the inline end for your own messages, full-width content for others', with an
 * optional author, meta, status and actions.
 */
export function Message({
  from,
  author,
  meta,
  actions,
  status,
  statusLabel,
  className,
  children,
  ...props
}: MessageProps) {
  return (
    <article
      {...props}
      className={classNames('env-message', className)}
      data-from={from}
      data-status={status}
    >
      {(present(author) || present(meta)) && (
        <header className="env-message-header">
          {present(author) && <span className="env-message-author">{author}</span>}
          {present(meta) && <span className="env-message-meta">{meta}</span>}
        </header>
      )}
      <div className="env-message-content" data-text={typeof children === 'string' || undefined}>
        {children}
      </div>
      {status != null && (
        <div className="env-message-status">
          {status === 'sending' ? (
            <Spinner size="small" />
          ) : (
            <DecorativeIcon>
              <ErrorIcon />
            </DecorativeIcon>
          )}
          <span>{statusLabel ?? statusLabels[status]}</span>
        </div>
      )}
      {present(actions) && <div className="env-message-actions">{actions}</div>}
    </article>
  );
}

export interface MessageListProps extends ComponentPropsWithRef<'div'> {
  /**
   * Messages are still changing, such as a reply streaming in or earlier messages loading. The log
   * reports aria-busy, so assistive technology can wait for the change to finish instead of
   * announcing every step.
   */
  busy?: boolean;
}

/**
 * The messages of a conversation in order, as a log: assistive technology politely announces
 * messages added anywhere in it and text that changes. Set busy while a reply streams in or earlier
 * messages load. Name it with aria-label or aria-labelledby.
 */
export function MessageList({ busy = false, className, ...props }: MessageListProps) {
  return (
    <div
      aria-live="polite"
      aria-busy={busy || undefined}
      {...props}
      role="log"
      className={classNames('env-message-list', className)}
    />
  );
}
