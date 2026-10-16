import { useEffect, useRef, useState } from 'react';
import { Button, DropZone, Stack, Text } from '@envsemble/envui';

const twoMegabytes = 2 * 1024 * 1024;

export default function LogoUpload() {
  const picker = useRef<HTMLInputElement>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>();
  const [error, setError] = useState<string>();

  // A URL for the chosen image, released when it changes.
  useEffect(() => {
    if (!logo) return setPreview(undefined);
    const url = URL.createObjectURL(logo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logo]);

  return (
    <Stack gap={3}>
      <DropZone
        hidden={logo != null}
        inputRef={picker}
        label="Drop a logo here, or browse"
        description="PNG, JPG or WebP up to 2 MB"
        accept="image/png,image/jpeg,.webp"
        error={error}
        onFiles={([file]) => {
          // The zone checks the type; the size is the application's to check.
          if (file.size > twoMegabytes) return setError('Choose an image up to 2 MB.');
          setError(undefined);
          setLogo(file);
        }}
        onReject={() => setError('Choose a PNG, JPG or WebP image.')}
      />
      {logo && (
        <Stack direction="row" wrap align="center" gap={4}>
          <img src={preview} alt="" width={48} height={48} style={{ borderRadius: '0.5rem' }} />
          <Text render={<span />}>{logo.name}</Text>
          {/* Replace opens the zone's file picker while the zone is hidden. */}
          <Button variant="secondary" onClick={() => picker.current?.click()}>
            Replace
          </Button>
          <Button variant="text" onClick={() => setLogo(null)}>
            Remove
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
