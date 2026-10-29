'use client';

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type DragEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { Grid } from '../foundations/Layout.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { ActionElement } from '../internal/ActionElement.js';
import { FileInput } from '../internal/FileInput.js';
import { setRef } from '../internal/setRef.js';
import { Spinner } from '../feedback/Spinner.js';
import { CloudUpload } from '../icons/CloudUpload.js';
import * as Field from './Field.js';
import { acceptsFile } from './internal/acceptsFile.js';
import { subscribeFormReset } from './internal/subscribeFormReset.js';
import '../styles/Base.css';
import '../styles/DropZone.css';

export interface DropZoneProps
  extends Omit<
    ComponentPropsWithRef<'div'>,
    'children' | 'onDragEnter' | 'onDragOver' | 'onDragLeave' | 'onDrop'
  > {
  /**
   * What to drop or choose, such as "Drop a logo here, or browse". With the description, it names
   * the zone, as its visible text does.
   */
  label: ReactNode;
  /** Which files fit, such as "PNG, JPG or WebP up to 2 MB"; it is read as part of the name. */
  description?: ReactNode;
  /** Replaces the upload icon. */
  icon?: ReactNode;
  /**
   * The file types the zone takes, as in the native accept attribute: MIME types such as image/png,
   * groups such as image/*, and extensions such as .webp. Any file by default.
   */
  accept?: string;
  /** Take several files at once; otherwise the zone takes the first file. */
  multiple?: boolean;
  /** Receives the dropped or chosen files that the zone takes. */
  onDropAccepted: (files: File[]) => void;
  /** Receives the files that do not match accept, and those after the first without multiple. */
  onDropRejected?: (files: File[]) => void;
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
  /** The native file input that opens the file picker, for example from a Replace button. */
  inputRef?: Ref<HTMLInputElement>;
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
  onDropAccepted,
  onDropRejected,
  disabled = false,
  pending = false,
  error,
  size = 'md',
  name,
  files,
  form,
  inputRef,
  className,
  ...props
}: DropZoneProps) {
  const id = useId();
  // The picker opens the file dialog; a separate named input holds the files a form submits, so
  // the picker can clear after every choice and people can choose the same file again.
  const picker = useRef<HTMLInputElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  // Entering a child of the zone leaves its parent first, so count the elements under the files.
  const depth = useRef(0);
  const latestFiles = useRef(files);
  latestFiles.current = files;
  const available = !disabled && !pending;

  /** Native forms submit exactly these files, also when they were dropped. */
  function hold(next: readonly File[]) {
    const element = field.current;
    if (!element || typeof DataTransfer !== 'function') return;
    const transfer = new DataTransfer();
    next.forEach((file) => transfer.items.add(file));
    element.files = transfer.files;
  }

  useLayoutEffect(() => {
    if (files !== undefined) hold(files);
  }, [files, name]);

  useEffect(
    function keepFilesAfterFormReset() {
      const owner = field.current?.form;
      if (!owner) return;
      // The browser empties the named input; files the application keeps stay.
      return subscribeFormReset(owner, () => {
        if (latestFiles.current !== undefined) hold(latestFiles.current);
      });
    },
    [form, name],
  );

  function take(chosen: File[]) {
    const matching = chosen.filter((file) => acceptsFile(file, accept));
    const taken = multiple ? matching : matching.slice(0, 1);
    const rejected = chosen.filter((file) => !taken.includes(file));
    // Rejected files leave the held ones as they were, and files from the application win.
    if (taken.length > 0 && files === undefined) hold(taken);
    if (rejected.length > 0) onDropRejected?.(rejected);
    if (taken.length > 0) onDropAccepted(taken);
  }

  function endDrag() {
    depth.current = 0;
    setDragging(false);
  }

  // The zone's name is its visible text, the label and the description; the error describes it.
  const nameIds = [`${id}-label`, description != null && `${id}-description`]
    .filter(Boolean)
    .join(' ');

  const target = (
    <ActionElement
      disabled={disabled}
      pending={pending}
      aria-labelledby={nameIds}
      aria-describedby={error != null ? `${id}-error` : undefined}
      onClick={() => {
        if (available) picker.current?.click();
      }}
    />
  );
  const targetContent = (
    <>
      <span className="env-drop-zone-icon">
        {pending ? (
          <Spinner size={size === 'sm' ? 'sm' : 'md'} />
        ) : (
          <DecorativeIcon>{icon ?? <CloudUpload />}</DecorativeIcon>
        )}
      </span>
      <Grid render={<span />} gap={size === 'sm' ? 0 : 1} className="env-drop-zone-text">
        <span className="env-drop-zone-label" id={`${id}-label`}>
          {label}
        </span>
        {description != null && (
          <>
            {/* A space between the lines, so the visible text reads as the name does. */}{' '}
            <span className="env-drop-zone-description" id={`${id}-description`}>
              {description}
            </span>
          </>
        )}
      </Grid>
    </>
  );
  return (
    <Field.Root
      {...props}
      invalid={error != null || undefined}
      className={classNames('env-drop-zone', className)}
      data-size={size}
      data-dragging={dragging ? '' : undefined}
      data-pending={pending ? '' : undefined}
      data-invalid={error != null ? '' : undefined}
      onDragEnter={(event) => {
        if (!carriesFiles(event)) return;
        event.preventDefault();
        depth.current += 1;
        if (available) setDragging(true);
      }}
      onDragOver={(event) => {
        if (!carriesFiles(event)) return;
        // Taking over the drop keeps the browser from opening the file, also while unavailable.
        event.preventDefault();
        event.dataTransfer.dropEffect = available ? 'copy' : 'none';
      }}
      onDragLeave={(event) => {
        if (!carriesFiles(event)) return;
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setDragging(false);
      }}
      onDrop={(event) => {
        if (!carriesFiles(event)) return;
        event.preventDefault();
        endDrag();
        if (available) take(Array.from(event.dataTransfer.files));
      }}
    >
      <Grid gap={3} className="env-drop-zone-target" render={target}>
        {targetContent}
      </Grid>
      <FileInput
        ref={(node) => {
          picker.current = node;
          setRef(inputRef, node);
        }}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onFiles={(chosen) => {
          if (available) take(chosen);
        }}
      />
      {name ? (
        // Holds the files a form submits; people never choose files in it.
        <FileInput ref={field} multiple={multiple} name={name} form={form} disabled={disabled} />
      ) : null}
      {error != null && <Field.Error id={`${id}-error`}>{error}</Field.Error>}
    </Field.Root>
  );
}
