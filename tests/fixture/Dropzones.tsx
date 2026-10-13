import { useEffect, useRef, useState } from 'react';
import { Button, FileDropzone, Text, Theme, type ThemeValue } from '@envsemble/envui';

const names = (files: File[]) => files.map((file) => file.name).join(' ');

/** An image chosen in a drop zone, shown with actions to replace or remove it. */
function AvatarPicker() {
  const picker = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>();
  useEffect(() => {
    if (!avatar) return setPreview(undefined);
    const url = URL.createObjectURL(avatar);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatar]);
  return (
    <>
      <FileDropzone
        hidden={avatar != null}
        inputRef={picker}
        label="Drop an avatar here, or browse"
        description="Square images look best"
        accept="image/*"
        onFiles={([file]) => setAvatar(file ?? null)}
      />
      {avatar && (
        <div className="fixture-actions fixture-file-preview">
          <img src={preview} alt="" width={48} height={48} />
          <Text as="span">{avatar.name}</Text>
          <Button variant="secondary" onClick={() => picker.current?.click()}>
            Replace
          </Button>
          <Button variant="text" onClick={() => setAvatar(null)}>
            Remove
          </Button>
        </div>
      )}
    </>
  );
}

export function DropzonesFixture({ theme }: { theme: ThemeValue }) {
  const [taken, setTaken] = useState('');
  const [rejected, setRejected] = useState('');
  const [documents, setDocuments] = useState('');
  const [unavailable, setUnavailable] = useState('');
  const [submitted, setSubmitted] = useState('');
  return (
    <Theme theme={theme} data-testid={`dropzones-${theme}`} className="fixture-section">
      <FileDropzone
        label="Drop a logo here, or browse"
        description="PNG, JPG or WebP up to 2 MB"
        accept="image/png,image/jpeg,.webp"
        onFiles={(files) => setTaken(names(files))}
        onReject={(files) => setRejected(names(files))}
      />
      <output data-testid={`taken-${theme}`}>{taken}</output>
      <output data-testid={`rejected-${theme}`}>{rejected}</output>
      <FileDropzone
        compact
        multiple
        label="Attach documents"
        description="Any file, several at once"
        onFiles={(files) => setDocuments(names(files))}
      />
      <output data-testid={`documents-${theme}`}>{documents}</output>
      <FileDropzone
        pending
        label="Uploading the logo"
        description="This takes a moment"
        onFiles={(files) => setUnavailable(names(files))}
      />
      <FileDropzone
        disabled
        label="Uploads are paused"
        onFiles={(files) => setUnavailable(names(files))}
      />
      <output data-testid={`unavailable-${theme}`}>{unavailable}</output>
      <FileDropzone
        label="Drop a cover image"
        accept="image/*"
        error="Choose an image at least 1200 pixels wide."
        onFiles={() => undefined}
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setSubmitted(
            data
              .getAll('attachments')
              .map((value) => (value instanceof File ? value.name : String(value)))
              .join(' '),
          );
        }}
      >
        <FileDropzone
          compact
          multiple
          name="attachments"
          accept=".pdf,.txt"
          label="Add attachments"
          onFiles={() => undefined}
        />
        <div className="fixture-actions">
          <Button type="submit">Submit files</Button>
          <Button type="reset" variant="secondary">
            Reset files
          </Button>
        </div>
      </form>
      <output data-testid={`files-submitted-${theme}`}>{submitted}</output>
      <AvatarPicker />
    </Theme>
  );
}
