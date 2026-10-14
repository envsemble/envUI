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
  /** Who wrote the message, shown above it. */
  author?: ReactNode;
  /** Supporting facts beside the author, such as the time. */
  meta?: ReactNode;
  /** Small actions below the message, such as copy or retry. */
  actions?: ReactNode;
  /** A message on its way, or one that could not be sent; shown with an icon and text. */
  status?: MessageStatus;
  /** Text of the status: Sending or Not sent by default. */
  statusLabel?: string;
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

/** One entry of a conversation, such as a chat message or a comment. */
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
