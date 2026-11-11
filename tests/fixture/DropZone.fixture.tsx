import { useEffect, useRef, useState } from 'react';
import { Button, DropZone, Text, Theme, type ColorScheme } from '@envsemble/envui';

export const themes = true;

const names = (files: File[]) => files.map((file) => file.name).join(' ');

/**
 * An image chosen in a drop zone, shown with actions to replace or remove it; its form submits the
 * image the application keeps.
 */
function AvatarPicker({ theme }: { theme: ColorScheme }) {
  const picker = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>();
  const [submitted, setSubmitted] = useState('');
  useEffect(() => {
    if (!avatar) return setPreview(undefined);
    const url = URL.createObjectURL(avatar);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatar]);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const file = new FormData(event.currentTarget).get('avatar');
        setSubmitted(file instanceof File ? file.name : '');
      }}
    >
      <DropZone
        hidden={avatar != null}
        inputRef={picker}
        name="avatar"
        files={avatar ? [avatar] : []}
        label="Drop an avatar here, or browse"
        description="Square images look best"
        accept="image/*"
        onFilesAccepted={([file]) => setAvatar(file ?? null)}
      />
      {avatar && (
        <div className="fixture-actions fixture-file-preview">
          <img src={preview} alt="" width={48} height={48} />
          <Text render={<span />}>{avatar.name}</Text>
          <Button variant="secondary" onClick={() => picker.current?.click()}>
            Replace
          </Button>
          <Button variant="text" onClick={() => setAvatar(null)}>
            Remove
          </Button>
        </div>
      )}
      <Button type="submit" variant="secondary">
        Submit avatar
      </Button>
      <Button type="reset" variant="text">
        Reset avatar
      </Button>
      <output data-testid={`avatar-submitted-${theme}`}>{submitted}</output>
    </form>
  );
}

export default function DropZoneFixture({ theme }: { theme: ColorScheme }) {
  const [taken, setTaken] = useState('');
  const [rejected, setRejected] = useState('');
  const [documents, setDocuments] = useState('');
  const [unavailable, setUnavailable] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [attached, setAttached] = useState<string[]>([]);
  return (
    <Theme theme={theme} data-testid={`drop-zones-${theme}`} className="fixture-section">
      <DropZone
        label="Drop a logo here, or browse"
        description="PNG, JPG or WebP up to 2 MB"
        accept="image/png,image/jpeg,.webp"
        onFilesAccepted={(files) => setTaken(names(files))}
        onFilesRejected={(files) => setRejected(names(files))}
      />
      <output data-testid={`taken-${theme}`}>{taken}</output>
      <output data-testid={`rejected-${theme}`}>{rejected}</output>
      <DropZone
        size="sm"
        multiple
        label="Attach documents"
        description="Any file, several at once"
        onFilesAccepted={(files) => setDocuments(names(files))}
      />
      <output data-testid={`documents-${theme}`}>{documents}</output>
      <DropZone
        pending
        label="Uploading the logo"
        description="This takes a moment"
        onFilesAccepted={(files) => setUnavailable(names(files))}
      />
      <DropZone
        disabled
        label="Uploads are paused"
        onFilesAccepted={(files) => setUnavailable(names(files))}
      />
      <output data-testid={`unavailable-${theme}`}>{unavailable}</output>
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
        <DropZone
          size="sm"
          multiple
          name="attachments"
          accept=".pdf,.txt"
          label="Add attachments"
          onFilesAccepted={(files) => setAttached((list) => [...list, names(files)])}
        />
        <div className="fixture-actions">
          <Button type="submit">Submit files</Button>
          <Button type="reset" variant="secondary">
            Reset files
          </Button>
        </div>
      </form>
      <output data-testid={`files-submitted-${theme}`}>{submitted}</output>
      <output data-testid={`attached-${theme}`}>{attached.join(' | ')}</output>
      <AvatarPicker theme={theme} />
    </Theme>
  );
}
