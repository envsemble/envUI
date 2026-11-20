'use client';

import {
  useEffect,
  useId,
  useRef,
  type ComponentPropsWithRef,
  type ReactNode,
  type RefObject,
} from 'react';
import { IconButton } from '../../actions/Button.js';
import { IconContentCopy } from '../../icons/ContentCopy.js';
import { IconCheck } from '../../icons/Check.js';
import { codeBlock as codeBlockMessages } from '../../foundations/messages/codeBlock.js';
import { classNames } from '../../internal/classNames.js';
import { Row } from '../../layout/Layout.js';
import { useMessages } from '../../internal/provider/EnvUIContext.js';
import { useCopy } from '../../internal/useCopy.js';
import { flag } from '../../internal/flag.js';
import { Slot } from '../../internal/layout/Slot.js';
import { rendersContent } from '../../internal/react/rendersContent.js';
import '../../styles/Base.css';
import '../../styles/Code.css';

export interface CodeBlockFrameProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  source: string;
  language: string | undefined;
  label: ReactNode;
  headerEnd: ReactNode;
  copyable: boolean;
  wrap: boolean;
  preRef?: RefObject<HTMLPreElement | null>;
  children: ReactNode;
}

const copyResultDuration = 3_000;

function selectForPeopleToCopyThemselves(pre: HTMLPreElement) {
  const range = pre.ownerDocument.createRange();
  range.selectNodeContents(pre);
  const selection = pre.ownerDocument.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

export function CodeBlockFrame({
  source,
  language,
  label,
  headerEnd,
  copyable,
  wrap,
  preRef: givenPreRef,
  children,
  className,
  ...props
}: CodeBlockFrameProps) {
  const ownPreRef = useRef<HTMLPreElement>(null);
  const preRef = givenPreRef ?? ownPreRef;
  const messages = useMessages('codeBlock', codeBlockMessages);
  const { copy, status, reset } = useCopy({ resetAfter: copyResultDuration });
  useEffect(() => reset(), [source, reset]);

  async function copySource(button: HTMLElement) {
    if (await copy(source, button)) return;
    if (preRef.current) selectForPeopleToCopyThemselves(preRef.current);
  }
  const labelId = useId();
  const labelled = Boolean(label);
  const hasHeaderEnd = rendersContent(headerEnd);
  const copyButton = copyable && (
    <IconButton
      variant="ghost"
      icon={status === 'copied' ? <IconCheck /> : <IconContentCopy />}
      aria-label={status === 'copied' ? messages.copied : messages.copy}
      onClick={(event) => void copySource(event.currentTarget)}
    />
  );
  return (
    <div {...props} className={classNames('env-code-block', className)} data-wrap={flag(wrap)}>
      {(labelled || copyable || hasHeaderEnd) && (
        <Row wrap align="center" justify="between" gap={4} className="env-code-block-header">
          <span id={labelled ? labelId : undefined}>{label ?? language ?? messages.title}</span>
          {hasHeaderEnd ? (
            <Row align="center" gap={1}>
              <Slot className="env-code-block-header-end" layout="row">
                {headerEnd}
              </Slot>
              {copyButton}
            </Row>
          ) : (
            copyButton
          )}
        </Row>
      )}
      <pre
        ref={preRef}
        tabIndex={0}
        aria-labelledby={labelled ? labelId : undefined}
        aria-label={
          labelled ? undefined : messages.label({ language: language ?? messages.plainText })
        }
      >
        <code>{children}</code>
      </pre>
      {copyable && (
        <span className="env-code-block-copy-status" role="status">
          {status === 'copied'
            ? messages.copiedStatus
            : status === 'failed'
              ? messages.selected
              : ''}
        </span>
      )}
    </div>
  );
}
