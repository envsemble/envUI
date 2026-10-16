'use client';

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
import { Button, type ButtonProps, type IconButtonEmphasisProps } from './Button.js';
import { TooltipNestingContext, TooltipPopup } from '../feedback/internal/TooltipPopup.js';
import { Check } from '../icons/Check.js';
import { ContentCopy } from '../icons/ContentCopy.js';
import { classNames } from '../internal/classNames.js';
import { useButtonEmphasis } from '../internal/ControlDefaults.js';
import { writeToClipboard } from '../internal/useCopy.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { copy as copyMessages } from '../foundations/messages/copy.js';
import type { ControlSize } from '../foundations/Theme.js';

interface CopyButtonBaseProps
  extends Omit<ComponentPropsWithRef<'button'>, 'value' | 'onCopy' | 'children' | 'type'> {
  /** The text to copy, or a function that returns it, also as a promise, when pressed. */
  value: string | (() => string | Promise<string>);
  /** Runs once the text is on the clipboard, with that text. */
  onCopy?: (text: string) => void;
  /** As Button's: sm, md or lg; without it, the control height of the container. */
  size?: ControlSize;
  /** The icon at rest, ContentCopy by default; a check replaces it once the text is copied. */
  icon?: ReactNode;
  /** Shown in the tooltip and announced after copying; Copied by default. */
  copiedLabel?: string;
  /** Shown in the tooltip and announced when nothing could be copied; Couldn’t copy by default. */
  failedLabel?: string;
  /**
   * The button's name, also in an icon-only button's tooltip, where it has none of its own: no
   * aria-label or aria-labelledby, and a label without words, such as an empty string; Copy by
   * default.
   */
  copyLabel?: string;
}

/**
 * A visible label: text or elements, rather than nothing, such as false or null. A label without
 * words, such as an empty string, leaves the button icon-only, named by copyLabel.
 */
export type CopyButtonLabel = Exclude<ReactNode, boolean | null | undefined>;

/**
 * The variant and tone, as IconButton's designed pairs: without a variant, the container's, such as
 * ghost in a toolbar, and else a neutral secondary button.
 */
export type CopyButtonProps = CopyButtonBaseProps &
  IconButtonEmphasisProps &
  (
    | {
        /**
         * Without children, or with children that render nothing, the button is icon-only, named by
         * aria-label, such as Copy link; a blank one leaves it named by copyLabel.
         */
        children?: boolean | null;
        'aria-label': string;
      }
    | { children: CopyButtonLabel; 'aria-label'?: string }
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
  variant,
  tone,
  size,
  icon,
  copiedLabel: ownCopiedLabel,
  failedLabel: ownFailedLabel,
  copyLabel: ownCopyLabel,
  children,
  className,
  onClick,
  'aria-label': label,
  ...props
}: CopyButtonProps) {
  // A label prop wins over the provider's messages, which win over the English defaults.
  const messages = useMessages('copy', copyMessages);
  const copiedLabel = ownCopiedLabel ?? messages.copied;
  const failedLabel = ownFailedLabel ?? messages.failed;
  const copyLabel = ownCopyLabel ?? messages.copy;
  const emphasis = useButtonEmphasis({ variant, tone, fallbackVariant: 'secondary' });
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
      text = await writeToClipboard(value, event.currentTarget, {
        onWait: () => setWaiting(true),
        fieldClassName: 'env-copy-button-field',
      });
    } catch {
      copied = false;
    }
    setCopying(false);
    setWaiting(false);
    // Every press shows and announces its result again, also the same result twice in a row.
    setResult((current) => ({ copied, count: (current?.count ?? 0) + 1 }));
    if (copied) onCopy?.(text);
  }

  // A label without words, such as an empty string, leaves the button icon-only, as it looks.
  const iconOnly = !hasWords(children);
  // The button always has a name: its own, its label's words, or else copyLabel.
  const ownName = label?.trim() ? label : undefined;
  const named = ownName !== undefined || props['aria-labelledby'] != null || !iconOnly;
  const name = named ? ownName : copyLabel;
  // A disabled button takes no pointer or focus events: around it, a target shows its name.
  const disabled = Boolean(props.disabled);
  const feedback = result ? (result.copied ? copiedLabel : failedLabel) : undefined;
  const tooltip = feedback ?? (iconOnly ? name : undefined);
  // The last text stays in the closing tooltip while it fades out.
  if (tooltip) shownText.current = tooltip;
  const symbol = result?.copied ? <Check /> : (icon ?? <ContentCopy />);
  const shared = {
    ...props,
    ...emphasis,
    pending: waiting,
    onClick: copy,
    className: classNames('env-copy-button', className),
    size,
    'data-copied': result?.copied ? '' : undefined,
    'data-failed': result && !result.copied ? '' : undefined,
  };
  const button = iconOnly ? (
    <Button
      {...({ ...shared, iconOnly: true, icon: symbol, 'aria-label': name ?? '' } as ButtonProps)}
    />
  ) : (
    <Button
      {...({
        ...shared,
        startIcon: symbol,
        'aria-label': name,
        children: children as CopyButtonLabel,
      } as ButtonProps)}
    />
  );
  const hoverTarget = iconOnly && disabled;
  return (
    <>
      {nested ? (
        button
      ) : (
        <BaseTooltip.Root
          // A control that becomes enabled or disabled changes the trigger element; a fresh
          // tooltip listens to the new one, as Tooltip does.
          key={hoverTarget ? 'disabled' : 'enabled'}
          // A press ends the hover, as on any tooltip, but the name stays until the result
          // replaces it. The result shows whether or not the pointer is still on the button,
          // until it ends or Escape hides it.
          open={result !== null || (iconOnly && (hovered || copying))}
          onOpenChange={(open, details) => {
            setHovered(open);
            if (!open && details.reason === 'escape-key') setResult(null);
          }}
        >
          <BaseTooltip.Trigger
            delay={400}
            render={
              hoverTarget ? <span className="env-tooltip-disabled-target" tabIndex={0} /> : button
            }
          >
            {hoverTarget ? button : undefined}
          </BaseTooltip.Trigger>
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

/**
 * Whether a label has words: text other than white space, or an element, which may render some.
 * Empty text, and a list of nothing else, have none.
 */
function hasWords(label: ReactNode): boolean {
  if (label === null || label === undefined || typeof label === 'boolean') return false;
  if (typeof label === 'string') return label.trim() !== '';
  if (typeof label === 'object' && Symbol.iterator in label) return [...label].some(hasWords);
  return true;
}
