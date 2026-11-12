import { useEffect, useRef, useState } from 'react';
import { Button, DropZone, Column, Graphic, Row, Text } from '@envsemble/envui';

const twoMegabytes = 2 * 1024 * 1024;

export default function LogoUpload() {
  const picker = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<File | null>(null);
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

  // Uploading takes a moment; a timer stands in for it here.
  useEffect(() => {
    if (!uploading) return;
    const timer = window.setTimeout(() => {
      setLogo(uploading);
      setUploading(null);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [uploading]);

  return (
    // As wide as a form column.
    <Column gap={3} style={{ inlineSize: 'min(100%, 24rem)' }}>
      <DropZone
        hidden={logo != null}
        inputRef={picker}
        label={uploading ? `Uploading ${uploading.name}` : 'Drop a logo here, or browse'}
        description={uploading ? 'This takes a moment' : 'PNG, JPG or WebP up to 2 MB'}
        accept="image/png,image/jpeg,.webp"
        pending={uploading != null}
        error={error}
        onFilesAccepted={([file]) => {
          // The zone checks the type; the size is the application's to check.
          if (file.size > twoMegabytes) return setError('Choose an image up to 2 MB.');
          setError(undefined);
          setUploading(file);
        }}
        onFilesRejected={() => setError('Choose a PNG, JPG or WebP image.')}
      />
      {logo && (
        <Row wrap align="center" gap={4}>
          <Graphic src={preview} alt="" size="lg" />
          <Text render={<span />}>{logo.name}</Text>
          {/* Replace opens the zone's file picker while the zone is hidden. */}
          <Button variant="secondary" onClick={() => picker.current?.click()}>
            Replace
          </Button>
          <Button variant="text" onClick={() => setLogo(null)}>
            Remove
          </Button>
        </Row>
      )}
    </Column>
  );
}
