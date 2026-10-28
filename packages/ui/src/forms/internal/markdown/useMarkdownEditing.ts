'use client';

import { useCallback, useLayoutEffect, useRef, useState, type ChangeEvent } from 'react';
import { subscribeFormReset } from '../subscribeFormReset.js';
import { readMarkdownSelection, type MarkdownSelection } from './markdownFormatting.js';
import {
  createMarkdownHistory,
  moveMarkdownHistory,
  recordMarkdownEdit,
} from './markdownHistory.js';

export function useMarkdownEditing({
  value,
  defaultValue = '',
  onValueChange,
  form,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  form?: string;
}) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const content = value ?? uncontrolledValue;
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [inputElement, setInputElement] = useState<HTMLTextAreaElement | null>(null);
  const history = useRef(createMarkdownHistory(content));
  const beforeInput = useRef<MarkdownSelection | null>(null);
  const pendingSelection = useRef<MarkdownSelection | null>(null);
  const composing = useRef(false);
  const valueChange = useRef(onValueChange);
  const [revision, setRevision] = useState(0);
  const attachInput = useCallback((input: HTMLTextAreaElement | null) => {
    inputRef.current = input;
    setInputElement(input);
  }, []);

  useLayoutEffect(() => {
    valueChange.current = onValueChange;
  }, [onValueChange]);

  useLayoutEffect(() => {
    // A replacement supplied by the application starts a fresh document history.
    if (history.current.entries[history.current.index].value !== content) {
      history.current = createMarkdownHistory(content);
      pendingSelection.current = null;
      setRevision((current) => current + 1);
    }
    const input = inputRef.current;
    if (!input) return;
    if (input.value !== content) input.value = content;
    const selection = pendingSelection.current;
    if (selection?.value === content) {
      input.focus({ preventScroll: true });
      input.setSelectionRange(selection.start, selection.end, selection.direction);
      pendingSelection.current = null;
    }
  }, [content, revision, inputElement]);

  function emit(selection: MarkdownSelection, restoreSelection: boolean) {
    pendingSelection.current = restoreSelection ? selection : null;
    setUncontrolledValue(selection.value);
    valueChange.current?.(selection.value);
    setRevision((current) => current + 1);
  }
  function moveHistory(direction: -1 | 1) {
    const input = inputRef.current;
    if (!input || input.disabled || input.readOnly || composing.current) return;
    const selection = moveMarkdownHistory(history.current, direction);
    if (selection) emit(selection, true);
  }

  useLayoutEffect(() => {
    if (!inputElement) return;
    function captureBeforeInput(event: InputEvent) {
      if (event.inputType === 'historyUndo' || event.inputType === 'historyRedo') {
        if (event.cancelable) {
          event.preventDefault();
          moveHistory(event.inputType === 'historyUndo' ? -1 : 1);
        }
      } else if (inputRef.current) beforeInput.current = readMarkdownSelection(inputRef.current);
    }
    inputElement.addEventListener('beforeinput', captureBeforeInput);
    return () => inputElement.removeEventListener('beforeinput', captureBeforeInput);
  });

  useLayoutEffect(() => {
    const owningForm = inputElement?.form;
    if (!owningForm || !inputElement) return;
    return subscribeFormReset(owningForm, () => {
      const resetValue = value ?? defaultValue;
      inputElement.value = resetValue;
      history.current = createMarkdownHistory(resetValue);
      beforeInput.current = null;
      pendingSelection.current = null;
      setUncontrolledValue(resetValue);
      setRevision((current) => current + 1);
    });
  }, [inputElement, value, defaultValue, form]);

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const inputType = (event.nativeEvent as InputEvent).inputType ?? 'input';
    if (inputType === 'historyUndo' || inputType === 'historyRedo') {
      moveHistory(inputType === 'historyUndo' ? -1 : 1);
      return;
    }
    const after = readMarkdownSelection(event.currentTarget);
    const before = beforeInput.current ?? history.current.entries[history.current.index];
    beforeInput.current = null;
    if (before.value !== after.value) recordMarkdownEdit(history.current, before, after, inputType);
    emit(after, false);
  }
  function apply(before: MarkdownSelection, after: MarkdownSelection) {
    const input = inputRef.current;
    // A picker may resolve after props change. Check the current native control, not old props.
    if (
      !input ||
      input.disabled ||
      input.readOnly ||
      composing.current ||
      input.value !== before.value
    )
      return false;
    if (input.maxLength >= 0 && after.value.length > input.maxLength) return false;
    recordMarkdownEdit(history.current, before, after, 'format');
    emit(after, true);
    return true;
  }
  function captureSelection() {
    return inputRef.current ? readMarkdownSelection(inputRef.current) : null;
  }
  return {
    content,
    inputRef,
    attachInput,
    handleChange,
    captureSelection,
    apply,
    moveHistory,
    composing,
    canUndo: history.current.index > 0,
    canRedo: history.current.index < history.current.entries.length - 1,
  };
}
