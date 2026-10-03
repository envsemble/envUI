import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { classNames } from '../../internal/classNames.js';

/** Shared native control; field composition stays with Textarea and MarkdownEditor. */
export const TextareaControl = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function TextareaControl({ className, ...props }, ref) {
  return <textarea {...props} ref={ref} className={classNames('env-text-input', className)} />;
});
