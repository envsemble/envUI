'use client';

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type DragEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { Grid } from '../layout/Layout.js';
import { DecorativeIcon } from '../internal/icon/DecorativeIcon.js';
import { Slot } from '../internal/layout/Slot.js';
import { ActionElement } from '../internal/control/ActionElement.js';
import { FileInput } from './internal/FileInput.js';
import { mergeRefs } from '../internal/react/setRef.js';
import { Spinner } from '../feedback/Spinner.js';
import { VisuallyHidden } from '../content/VisuallyHidden.js';
import { IconCloudUpload } from '../icons/CloudUpload.js';
import * as Field from './Field.js';
import { useFormReset } from '../internal/field/useFormReset.js';
import { fieldDescribedBy, fieldPartIds } from '../internal/field/useFieldControl.js';
import { flag } from '../internal/flag.js';
import { idRefs } from '../internal/dom/idRefs.js';
import '../styles/Base.css';
import '../styles/DropZone.css';

export interface DropZoneProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'onDragEnter' | 'onDragOver' | 'onDragLeave' | 'onDrop'
> {
  /**
   * What to drop or choose, such as "Drop a logo here, or browse". With the description, it names
   * the zone, as its visible text does; without the target, only assistive technology reads it.
   */
  label: ReactNode;
  /** Which files fit, such as "PNG, JPG or WebP up to 2 MB"; it is read as part of the name. */
  description?: ReactNode;
  /** Replaces the upload icon. */
  icon?: ReactNode;
  /**
   * Content inside the zone, under its target, such as the chosen files with their previews and
   * Remove buttons, or a Browse button that opens the file picker through inputRef. Files dropped on
   * it are taken too; it can hold controls, since it is beside the target button, not inside it.
   */
  children?: ReactNode;
  /**
   * The file types the zone takes, as in the native accept attribute: MIME types such as image/png,
   * groups such as image/*, and extensions such as .webp.
   * @default any file
   */
  accept?: string;
  /** Take several files at once; otherwise the zone takes the first file. */
  multiple?: boolean;
  /** Receives the dropped or chosen files that the zone takes. */
  onFilesAccepted: (files: File[]) => void;
  /** Receives the files that do not match accept, and those after the first without multiple. */
  onFilesRejected?: (files: File[]) => void;
  /** The zone can't be pressed or focused and takes no files; it still keeps the browser from opening dropped files. */
  disabled?: boolean;
  /**
   * The application is working on the files: a spinner replaces the icon, the zone reports that it
   * is busy and takes no new files.
   */
  pending?: boolean;
  /** A message linked to the zone, whose outline takes the error color. */
  error?: ReactNode;
  /**
   * md is the tall area with a large icon; sm is one row with a small icon, for a form or a
   * sidebar.
   * @default 'md'
   */
  size?: 'sm' | 'md';
  /**
   * Submits files with a native form under this name: the last files the zone took, until the form
   * resets, or files.
   */
  name?: string;
  /**
   * The files a named zone submits when the application keeps them, such as after a Remove action;
   * they replace the files the zone took, also after the form resets.
   */
  files?: readonly File[];
  /** The id of a form the zone belongs to when it is outside of it. */
  form?: string;
  /**
   * The native file input that opens the file picker, for example from a Replace button; ref
   * reaches the zone itself.
   */
  inputRef?: Ref<HTMLInputElement>;
  /**
   * Show the target: the button with the icon, the label and the description that opens the file
   * picker. Without it, the zone is a group the label names, for content that has its own Browse
   * button, which opens the picker through inputRef, such as a table the files land in.
   * @default true
   */
  target?: boolean;
  /**
   * Another element to render the zone as, such as the application's own panel or table region,
   * which then takes dropped files: the zone's class, its state attributes, such as
   * data-drag-over, and its handlers merge into its props.
   */
  render?: ReactElement;
}

const spaceReadInName = ' ';

function takeOverDropFromBrowser(event: DragEvent) {
  event.preventDefault();
}

function carriesFiles(event: DragEvent) {
  return Array.from(event.dataTransfer.types).includes('Files');
}

/** A drop target for files that also opens the file picker; the application shows what was chosen. */
export function DropZone({
  label,
  description,
  icon,
  accept,
  multiple = false,
  onFilesAccepted,
  onFilesRejected,
  disabled = false,
  pending = false,
  error,
  size = 'md',
  name,
  files,
  form,
  inputRef,
  target: showsTarget = true,
  render,
  className,
  children,
  ...props
}: DropZoneProps) {
  const id = useId();
  const filePicker = useRef<HTMLInputElement>(null);
  const submittedFilesInput = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const elementsEnteredUnderDrag = useRef(0);
  const available = !disabled && !pending;

  function submitWithForm(next: readonly File[]) {
    const element = submittedFilesInput.current;
    if (!element || typeof DataTransfer !== 'function') return;
    const transfer = new DataTransfer();
    next.forEach((file) => transfer.items.add(file));
    element.files = transfer.files;
  }

  useLayoutEffect(() => {
    if (files !== undefined) submitWithForm(files);
  }, [files, name]);

  useFormReset(
    submittedFilesInput,
    function keepFilesAfterFormReset() {
      if (files !== undefined) submitWithForm(files);
    },
    form,
  );

  function take(chosen: File[]) {
    const matching = chosen.filter((file) => matchesNativeAccept(file, accept));
    const taken = multiple ? matching : matching.slice(0, 1);
    const rejected = chosen.filter((file) => !taken.includes(file));
    const applicationKeepsFiles = files !== undefined;
    if (taken.length > 0 && !applicationKeepsFiles) submitWithForm(taken);
    if (rejected.length > 0) onFilesRejected?.(rejected);
    if (taken.length > 0) onFilesAccepted(taken);
  }

  function endDrag() {
    elementsEnteredUnderDrag.current = 0;
    setDragging(false);
  }

  const ids = fieldPartIds(id);
  const visibleTextIds = idRefs(ids.label, description != null && ids.description);

  const target = (
    <ActionElement
      disabled={disabled}
      pending={pending}
      aria-labelledby={visibleTextIds}
      aria-describedby={error != null ? ids.error : undefined}
      onClick={() => {
        if (available) filePicker.current?.click();
      }}
    />
  );
  const targetContent = (
    <>
      <span className="env-drop-zone-icon">
        {pending ? (
          <Spinner size={size === 'sm' ? 'sm' : 'md'} />
        ) : (
          <Slot className="env-drop-zone-icon-content" element="span" layout="row" shrink="never">
            <DecorativeIcon>{icon ?? <IconCloudUpload />}</DecorativeIcon>
          </Slot>
        )}
      </span>
      <Grid render={<span />} gap={size === 'sm' ? 0 : 1} className="env-drop-zone-text">
        <span className="env-drop-zone-label" id={ids.label}>
          <Slot className="env-drop-zone-label-content" element="span">
            {label}
          </Slot>
        </span>
        {description != null && (
          <>
            {spaceReadInName}
            <span className="env-drop-zone-description" id={ids.description}>
              <Slot className="env-drop-zone-description-content" element="span">
                {description}
              </Slot>
            </span>
          </>
        )}
      </Grid>
    </>
  );
  const group = showsTarget
    ? {}
    : {
        role: 'group',
        'aria-labelledby': ids.label,
        'aria-describedby': fieldDescribedBy(id, undefined, description, error),
      };
  return (
    <Field.Root
      {...group}
      {...props}
      render={<Grid gap={3} render={render} />}
      invalid={error != null || undefined}
      className={classNames('env-drop-zone', className)}
      data-size={size}
      data-drag-over={flag(dragging)}
      data-pending={flag(pending)}
      data-invalid={flag(error != null)}
      onDragEnter={(event) => {
        if (!carriesFiles(event)) return;
        event.preventDefault();
        elementsEnteredUnderDrag.current += 1;
        if (available) setDragging(true);
      }}
      onDragOver={(event) => {
        if (!carriesFiles(event)) return;
        takeOverDropFromBrowser(event);
        event.dataTransfer.dropEffect = available ? 'copy' : 'none';
      }}
      onDragLeave={(event) => {
        if (!carriesFiles(event)) return;
        elementsEnteredUnderDrag.current = Math.max(0, elementsEnteredUnderDrag.current - 1);
        if (elementsEnteredUnderDrag.current === 0) setDragging(false);
      }}
      onDrop={(event) => {
        if (!carriesFiles(event)) return;
        event.preventDefault();
        endDrag();
        if (available) take(Array.from(event.dataTransfer.files));
      }}
    >
      {showsTarget ? (
        <Grid gap={3} className="env-drop-zone-target" render={target}>
          {targetContent}
        </Grid>
      ) : (
        <VisuallyHidden>
          <span id={ids.label}>{label}</span>
          {description != null && (
            <>
              {spaceReadInName}
              <span id={ids.description}>{description}</span>
            </>
          )}
        </VisuallyHidden>
      )}
      {children != null && <Slot className="env-drop-zone-content">{children}</Slot>}
      <FileInput
        ref={mergeRefs(filePicker, inputRef)}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onFiles={(chosen) => {
          if (available) take(chosen);
        }}
      />
      {name ? (
        <FileInput
          ref={submittedFilesInput}
          multiple={multiple}
          name={name}
          form={form}
          disabled={disabled}
        />
      ) : null}
      {error != null && <Field.Error id={ids.error}>{error}</Field.Error>}
    </Field.Root>
  );
}

function matchesNativeAccept(file: File, accept: string | undefined) {
  const patterns = (accept ?? '')
    .split(',')
    .map((pattern) => pattern.trim().toLowerCase())
    .filter(Boolean);
  if (patterns.length === 0) return true;
  const fileName = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return patterns.some((pattern) => {
    if (pattern.startsWith('.')) return fileName.endsWith(pattern);
    if (pattern.endsWith('/*')) return type.startsWith(pattern.slice(0, -1));
    return type === pattern;
  });
}
