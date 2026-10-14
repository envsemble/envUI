import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import {
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { Button, type ButtonVariant } from './Button.js';
import { TooltipNestingContext, TooltipPopup } from '../feedback/internal/TooltipPopup.js';
import { Check } from '../icons/Check.js';
import { ContentCopy } from '../icons/ContentCopy.js';
import { classNames } from '../internal/classNames.js';

interface CopyButtonBaseProps
  extends Omit<ComponentPropsWithRef<'button'>, 'value' | 'onCopy' | 'children' | 'type'> {
  /** The text to copy, or a function that returns it, also as a promise, when pressed. */
  value: string | (() => string | Promise<string>);
  /** Runs once the text is on the clipboard, with that text. */
  onCopy?: (text: string) => void;
  /** As Button; secondary by default. */
  variant?: ButtonVariant;
  /** standard (default) takes the surrounding density; compact is the 2 rem compact size anywhere. */
  size?: 'standard' | 'compact';
  /** The icon at rest, ContentCopy by default; a check replaces it once the text is copied. */
  icon?: ReactNode;
  /** Shown in the tooltip and announced after copying; Copied by default. */
  copiedLabel?: string;
  /** Shown in the tooltip and announced when nothing could be copied; Couldn’t copy by default. */
  failedLabel?: string;
}

export type CopyButtonProps = CopyButtonBaseProps &
  (
    | {
        /** Without children the button is icon-only, named by aria-label, such as Copy link. */
        children?: never;
        'aria-label': string;
      }
    | { children: ReactNode; 'aria-label'?: string }
  );

/** How long the result of a press shows: the check, the tooltip and the announcement. */
const feedbackDuration = 2_000;

/**
 * Copies text to the clipboard. Icon-only by default, with its name in a tooltip, or a labelled
 * button with children. After a press the icon becomes a check, and Copied shows in the tooltip and
 * is announced for two seconds, or Couldn’t copy when the clipboard refuses.
 */
export function CopyButton({
  value,
  onCopy,
  variant = 'secondary',
  size = 'standard',
  icon,
  copiedLabel = 'Copied',
  failedLabel = 'Couldn’t copy',
  children,
  className,
  onClick,
  'aria-label': label,
  ...props
}: CopyButtonProps) {
  // Inside an application's own Tooltip, that tooltip describes the button.
  const nested = useContext(TooltipNestingContext);
  const [result, setResult] = useState<{ copied: boolean; count: number } | null>(null);
  const [hovered, setHovered] = useState(false);
  // From the press until the result shows; waiting while a promised text is on its way.
  const [copying, setCopying] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const shownText = useRef('');
  useEffect(() => {
    if (!result) return;
    const timer = setTimeout(() => setResult(null), feedbackDuration);
    return () => clearTimeout(timer);
  }, [result]);

  async function copy(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    setCopying(true);
    let copied = true;
    let text = '';
    try {
      text = await writeToClipboard(value, event.currentTarget, () => setWaiting(true));
    } catch {
      copied = false;
    }
    setCopying(false);
    setWaiting(false);
    // Every press shows and announces its result again, also the same result twice in a row.
    setResult((current) => ({ copied, count: (current?.count ?? 0) + 1 }));
    if (copied) onCopy?.(text);
  }

  const iconOnly = children === undefined || children === null;
  const feedback = result ? (result.copied ? copiedLabel : failedLabel) : undefined;
  const tooltip = feedback ?? (iconOnly ? label : undefined);
  // The last text stays in the closing tooltip while it fades out.
  if (tooltip) shownText.current = tooltip;
  const symbol = result?.copied ? <Check /> : (icon ?? <ContentCopy />);
  const shared = {
    ...props,
    variant,
    pending: waiting,
    onClick: copy,
    className: classNames('env-copy-button', className),
    'data-size': size === 'compact' ? 'compact' : undefined,
    'data-copied': result?.copied ? '' : undefined,
    'data-failed': result && !result.copied ? '' : undefined,
  };
  const button = iconOnly ? (
    <Button {...shared} iconOnly icon={symbol} aria-label={label ?? ''} />
  ) : (
    <Button {...shared} startIcon={symbol} aria-label={label}>
      {children}
    </Button>
  );
  return (
    <>
      {nested ? (
        button
      ) : (
        <BaseTooltip.Root
          // A press ends the hover, as on any tooltip, but the name stays until the result
          // replaces it. The result shows whether or not the pointer is still on the button,
          // until it ends or Escape hides it.
          open={result !== null || (iconOnly && (hovered || copying))}
          onOpenChange={(open, details) => {
            setHovered(open);
            if (!open && details.reason === 'escape-key') setResult(null);
          }}
        >
          <BaseTooltip.Trigger delay={400} render={button} />
          <TooltipPopup content={shownText.current} side="top" />
        </BaseTooltip.Root>
      )}
      {/* A tooltip is not announced, so the result is, from a visually hidden status. */}
      <span className="env-copy-button-status" role="status">
        {result && <span key={result.count}>{feedback}</span>}
      </span>
    </>
  );
}

/** Writes the text with the asynchronous Clipboard API, or by copying a selection where it fails. */
async function writeToClipboard(
  value: CopyButtonProps['value'],
  anchor: HTMLElement,
  onWait: () => void,
) {
  const resolved = typeof value === 'function' ? value() : value;
  if (typeof resolved === 'string') {
    await writeText(resolved, anchor);
    return resolved;
  }
  onWait();
  const clipboard = typeof navigator === 'undefined' ? undefined : navigator.clipboard;
  if (typeof ClipboardItem !== 'undefined' && clipboard?.write) {
    // Some browsers allow writing only while handling the press: hand over an item at once and
    // let its text follow.
    try {
      const blob = resolved.then((text) => new Blob([text], { type: 'text/plain' }));
      await clipboard.write([new ClipboardItem({ 'text/plain': blob })]);
      return await resolved;
    } catch {
      // Write the text itself once it is ready.
    }
  }
  const text = await resolved;
  await writeText(text, anchor);
  return text;
}

async function writeText(text: string, anchor: HTMLElement) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    if (!copyWithSelection(text, anchor)) throw new Error('The clipboard is unavailable.');
  }
}

/** The fallback for pages without clipboard access: select the text in a hidden field and copy it. */
function copyWithSelection(text: string, anchor: HTMLElement) {
  const document = anchor.ownerDocument;
  const field = document.createElement('textarea');
  field.value = text;
  field.readOnly = true;
  field.tabIndex = -1;
  field.setAttribute('aria-hidden', 'true');
  field.className = 'env-copy-button-field';
  // Beside the button, so a dialog that keeps focus inside itself lets the field take it.
  (anchor.parentElement ?? document.body).append(field);
  const focused = document.activeElement;
  const selection = document.getSelection();
  const ranges = selection
    ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index))
    : [];
  field.focus({ preventScroll: true });
  field.select();
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }
  field.remove();
  (focused as HTMLElement | null)?.focus({ preventScroll: true });
  if (selection) {
    selection.removeAllRanges();
    for (const range of ranges) selection.addRange(range);
  }
  return copied;
}
