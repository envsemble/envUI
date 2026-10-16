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
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { setRef } from '../internal/setRef.js';
import { Spinner } from '../feedback/Spinner.js';
import { CloudUpload } from '../icons/CloudUpload.js';
import { Error as ErrorIcon } from '../icons/Error.js';
import { acceptsFile } from './internal/acceptsFile.js';
import { subscribeFormReset } from './internal/subscribeFormReset.js';

export interface DropZoneProps
  extends Omit<
    ComponentPropsWithRef<'div'>,
    'children' | 'onDragEnter' | 'onDragOver' | 'onDragLeave' | 'onDrop'
  > {
  /** What to drop or choose, such as "Drop a logo here, or browse"; the zone's accessible name. */
  label: ReactNode;
  /** Which files fit, such as "PNG, JPG or WebP up to 2 MB". */
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
  onFiles: (files: File[]) => void;
  /** Receives the files that do not match accept, and those after the first without multiple. */
  onReject?: (files: File[]) => void;
  disabled?: boolean;
  /**
   * The application is working on the files: a spinner replaces the icon, the zone reports that it
   * is busy and takes no new files.
   */
  pending?: boolean;
  /** A message linked to the zone, whose outline takes the error color. */
  error?: ReactNode;
  /** One row with a small icon instead of the tall area. */
  compact?: boolean;
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
  onFiles,
  onReject,
  disabled = false,
  pending = false,
  error,
  compact = false,
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
    if (rejected.length > 0) onReject?.(rejected);
    if (taken.length > 0) onFiles(taken);
  }

  function endDrag() {
    depth.current = 0;
    setDragging(false);
  }

  const descriptionIds =
    [description != null && `${id}-description`, error != null && `${id}-error`]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div
      {...props}
      className={classNames('env-form-field env-drop-zone', className)}
      data-compact={compact ? '' : undefined}
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
      <button
        type="button"
        className="env-drop-zone-target"
        disabled={disabled}
        aria-labelledby={`${id}-label`}
        aria-describedby={descriptionIds}
        aria-busy={pending || undefined}
        aria-disabled={pending || undefined}
        onClick={() => {
          if (available) picker.current?.click();
        }}
      >
        <span className="env-drop-zone-icon">
          {pending ? (
            <Spinner size={compact ? 'small' : 'standard'} />
          ) : (
            <DecorativeIcon>{icon ?? <CloudUpload />}</DecorativeIcon>
          )}
        </span>
        <span className="env-drop-zone-text">
          <span className="env-drop-zone-label" id={`${id}-label`}>
            {label}
          </span>
          {description != null && (
            <span className="env-drop-zone-description" id={`${id}-description`}>
              {description}
            </span>
          )}
        </span>
      </button>
      <input
        ref={(node) => {
          picker.current = node;
          setRef(inputRef, node);
        }}
        type="file"
        hidden
        tabIndex={-1}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(event) => {
          const element = event.currentTarget;
          const chosen = Array.from(element.files ?? []);
          element.value = '';
          if (available && chosen.length > 0) take(chosen);
        }}
      />
      {name ? (
        <input
          ref={field}
          type="file"
          hidden
          tabIndex={-1}
          multiple={multiple}
          name={name}
          form={form}
          disabled={disabled}
        />
      ) : null}
      {error != null && (
        <small className="env-field-error" id={`${id}-error`}>
          <ErrorIcon aria-hidden="true" focusable="false" />
          <span>{error}</span>
        </small>
      )}
    </div>
  );
}
