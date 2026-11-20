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
import {
  TooltipNestingContext,
  TooltipPopup,
  tooltipDelay,
} from '../internal/popup/TooltipPopup.js';
import { IconCheck } from '../icons/Check.js';
import { IconContentCopy } from '../icons/ContentCopy.js';
import { classNames } from '../internal/classNames.js';
import { useButtonEmphasis } from '../internal/control/ControlDefaults.js';
import { useCopy } from '../internal/react/useCopy.js';
import { useMessages } from '../internal/provider/EnvUIContext.js';
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

const resultDuration = 2_000;

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
  const messages = useMessages('copyButton', copyButtonMessages);
  const copiedLabel = ownCopiedLabel ?? messages.copied;
  const failedLabel = ownFailedLabel ?? messages.failed;
  const copyLabel = ownCopyLabel ?? messages.copy;
  const emphasis = useButtonEmphasis({ variant, tone, fallbackVariant: 'secondary' });
  const insideApplicationTooltip = useContext(TooltipNestingContext);
  const { copy, status, round, copying, waiting, reset } = useCopy({
    write,
    onCopied,
    resetAfter: resultDuration,
    fieldClassName: 'env-copy-button-field',
  });
  const result = status === 'idle' ? null : { copied: status === 'copied', count: round };
  const [hovered, setHovered] = useState(false);
  const lastTooltipText = useRef('');

  function press(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    void copy(value, event.currentTarget);
  }

  const iconOnly = !hasWords(children);
  const ownName = label?.trim() ? label : undefined;
  const named = ownName !== undefined || props['aria-labelledby'] != null || !iconOnly;
  const name = named ? ownName : copyLabel;
  const disabled = Boolean(props.disabled);
  const feedback = result ? (result.copied ? copiedLabel : failedLabel) : undefined;
  const tooltip = feedback ?? (iconOnly ? name : undefined);
  if (tooltip) lastTooltipText.current = tooltip;
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
        start: symbol,
        'aria-label': name,
        children,
      } as ButtonBaseProps)}
    />
  );
  const disabledButtonNeedsHoverTarget = iconOnly && disabled;
  const tooltipOpen = result !== null || (iconOnly && (hovered || copying));
  return (
    <>
      {insideApplicationTooltip ? (
        button
      ) : (
        <BaseTooltip.Root
          key={disabledButtonNeedsHoverTarget ? 'hover-target' : 'button'}
          open={tooltipOpen}
          onOpenChange={(open, details) => {
            setHovered(open);
            if (!open && details.reason === 'escape-key') reset();
          }}
        >
          <BaseTooltip.Trigger
            delay={tooltipDelay}
            render={
              disabledButtonNeedsHoverTarget ? (
                <span className="env-tooltip-disabled-target" tabIndex={0} />
              ) : (
                button
              )
            }
          >
            {disabledButtonNeedsHoverTarget ? button : undefined}
          </BaseTooltip.Trigger>
          <TooltipPopup content={lastTooltipText.current} side="top" />
        </BaseTooltip.Root>
      )}
      <span className="env-copy-button-status" role="status">
        {result && <span key={result.count}>{feedback}</span>}
      </span>
    </>
  );
}

function hasWords(label: ReactNode): boolean {
  if (label === null || label === undefined || typeof label === 'boolean') return false;
  if (typeof label === 'string') return label.trim() !== '';
  if (typeof label === 'object' && Symbol.iterator in label) return [...label].some(hasWords);
  return true;
}
