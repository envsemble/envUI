'use client';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import {
  useContext,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type MouseEvent,
  type ReactNode,
} from 'react';
import type { IconButtonEmphasisProps } from './Button.js';
import { ButtonBase, type ButtonBaseProps } from './internal/ButtonBase.js';
import { TooltipNestingContext, TooltipPopup, tooltipDelay } from '../internal/TooltipPopup.js';
import { IconCheck } from '../icons/Check.js';
import { IconContentCopy } from '../icons/ContentCopy.js';
import { classNames } from '../internal/classNames.js';
import { useButtonEmphasis } from '../internal/ControlDefaults.js';
import { useCopy } from '../internal/useCopy.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { copyButton as copyButtonMessages } from '../foundations/messages/copyButton.js';
import type { ControlSize } from '../foundations/Theme.js';
import { flag } from '../internal/flag.js';
import '../styles/Base.css';
import '../styles/CopyButton.css';

interface CopyButtonBaseProps extends Omit<
  ComponentPropsWithRef<'button'>,
  'value' | 'onCopy' | 'children' | 'type'
> {
  /** The text to copy, or a function that returns it, also as a promise, when pressed. */
  value: string | (() => string | Promise<string>);
  /** Runs once the text is on the clipboard, with that text. */
  onCopied?: (text: string) => void;
  /**
   * Writes the text instead of the browser's Clipboard API, such as through a desktop app's
   * clipboard bridge. A rejected promise shows and announces failedLabel.
   */
  write?: (text: string) => Promise<void>;
  /** As Button's: sm, md or lg; without it, the control height of the container. */
  size?: ControlSize;
  /** The icon at rest, ContentCopy by default; a check replaces it once the text is copied. */
  icon?: ReactNode;
  /**
   * Shown in the tooltip and announced after copying.
   * @default 'Copied', or EnvUIProvider's messages.copyButton.copied
   */
  copiedLabel?: string;
  /**
   * Shown in the tooltip and announced when nothing could be copied.
   * @default 'Couldn’t copy', or EnvUIProvider's messages.copyButton.failed
   */
  failedLabel?: string;
  /**
   * The button's name, also in an icon-only button's tooltip, where it has none of its own: no
   * aria-label or aria-labelledby, and a label without words, such as an empty string.
   * @default 'Copy', or EnvUIProvider's messages.copyButton.copy
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
        /** The icon-only button's name, such as Copy link, which its tooltip shows. */
        'aria-label': string;
      }
    | {
        children: CopyButtonLabel;
        /** A name in place of the label's words, where they don't say it as wanted. */
        'aria-label'?: string;
      }
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
  onCopied,
  write,
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
  const messages = useMessages('copyButton', copyButtonMessages);
  const copiedLabel = ownCopiedLabel ?? messages.copied;
  const failedLabel = ownFailedLabel ?? messages.failed;
  const copyLabel = ownCopyLabel ?? messages.copy;
  const emphasis = useButtonEmphasis({ variant, tone, fallbackVariant: 'secondary' });
  // Inside an application's own Tooltip, that tooltip describes the button.
  const nested = useContext(TooltipNestingContext);
  // From the press until the result shows, copying; waiting while a promised text is on its way.
  // Every press shows and announces its result again, also the same result twice in a row.
  const { copy, status, round, copying, waiting, reset } = useCopy({
    write,
    onCopied,
    resetAfter: feedbackDuration,
    fieldClassName: 'env-copy-button-field',
  });
  const result = status === 'idle' ? null : { copied: status === 'copied', count: round };
  const [hovered, setHovered] = useState(false);
  const shownText = useRef('');

  function press(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    void copy(value, event.currentTarget);
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
  const symbol = result?.copied ? <IconCheck /> : (icon ?? <IconContentCopy />);
  const shared = {
    ...props,
    ...emphasis,
    pending: waiting,
    onClick: press,
    className: classNames('env-copy-button', className),
    size,
    'data-copied': flag(result?.copied),
    'data-failed': flag(result && !result.copied),
  };
  const button = iconOnly ? (
    <ButtonBase
      {...({
        ...shared,
        fallbackVariant: 'primary',
        iconOnly: true,
        icon: symbol,
        'aria-label': name ?? '',
      } as ButtonBaseProps)}
    />
  ) : (
    <ButtonBase
      {...({
        ...shared,
        fallbackVariant: 'primary',
        startIcon: symbol,
        'aria-label': name,
        children,
      } as ButtonBaseProps)}
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
            if (!open && details.reason === 'escape-key') reset();
          }}
        >
          <BaseTooltip.Trigger
            delay={tooltipDelay}
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
