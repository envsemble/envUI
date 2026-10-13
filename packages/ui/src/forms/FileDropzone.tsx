import {
  useEffect,
  useId,
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

export interface FileDropzoneProps
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
  /** Submits the files the zone took with a native form under this name. */
  name?: string;
  /** The id of a form the zone belongs to when it is outside of it. */
  form?: string;
  /** The native file input, for example to open the file picker from a Replace button. */
  inputRef?: Ref<HTMLInputElement>;
}

function carriesFiles(event: DragEvent) {
  return Array.from(event.dataTransfer.types).includes('Files');
}

/** A drop target for files that also opens the file picker; the application shows what was chosen. */
export function FileDropzone({
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
  form,
  inputRef,
  className,
  ...props
}: FileDropzoneProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  // Entering a child of the zone leaves its parent first, so count the elements under the files.
  const depth = useRef(0);
  // The files a named input holds for native forms: the last ones the zone took.
  const held = useRef<File[]>([]);
  const available = !disabled && !pending;
  useEffect(
    function subscribeToFormReset() {
      const owner = input.current?.form;
      if (!owner) return;
      return subscribeFormReset(owner, () => {
        held.current = [];
      });
    },
    [form],
  );

  function take(files: File[]) {
    const matching = files.filter((file) => acceptsFile(file, accept));
    const taken = multiple ? matching : matching.slice(0, 1);
    const rejected = files.filter((file) => !taken.includes(file));
    if (taken.length > 0) held.current = taken;
    const element = input.current;
    if (element && name && typeof DataTransfer === 'function') {
      // Native forms submit exactly the files the zone took, also when they were dropped.
      const transfer = new DataTransfer();
      held.current.forEach((file) => transfer.items.add(file));
      element.files = transfer.files;
    } else if (element && !name) {
      // Without a form, clearing the input lets people choose the same file again.
      element.value = '';
    }
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
      className={classNames('env-form-field env-file-dropzone', className)}
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
        className="env-file-dropzone-target"
        disabled={disabled}
        aria-labelledby={`${id}-label`}
        aria-describedby={descriptionIds}
        aria-busy={pending || undefined}
        aria-disabled={pending || undefined}
        onClick={() => {
          if (available) input.current?.click();
        }}
      >
        <span className="env-file-dropzone-icon">
          {pending ? (
            <Spinner size={compact ? 'small' : 'standard'} />
          ) : (
            <DecorativeIcon>{icon ?? <CloudUpload />}</DecorativeIcon>
          )}
        </span>
        <span className="env-file-dropzone-text">
          <span className="env-file-dropzone-label" id={`${id}-label`}>
            {label}
          </span>
          {description != null && (
            <span className="env-file-dropzone-description" id={`${id}-description`}>
              {description}
            </span>
          )}
        </span>
      </button>
      <input
        ref={(node) => {
          input.current = node;
          setRef(inputRef, node);
        }}
        type="file"
        hidden
        tabIndex={-1}
        accept={accept}
        multiple={multiple}
        name={name}
        form={form}
        disabled={disabled}
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? []);
          if (available && files.length > 0) take(files);
        }}
      />
      {error != null && (
        <small className="env-field-error" id={`${id}-error`}>
          <ErrorIcon aria-hidden="true" focusable="false" />
          <span>{error}</span>
        </small>
      )}
    </div>
  );
}
