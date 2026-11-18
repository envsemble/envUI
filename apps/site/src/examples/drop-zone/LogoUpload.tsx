import { useEffect, useRef, useState } from 'react';
import { Button, DropZone, Column, Graphic, Row, Text } from '@envsemble/envui';

const twoMegabytes = 2 * 1024 * 1024;
const simulatedUploadMs = 1500;

export default function LogoUpload() {
  const picker = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<File | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!logo) return setPreview(undefined);
    const url = URL.createObjectURL(logo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logo]);

  useEffect(() => {
    if (!uploading) return;
    const timer = window.setTimeout(() => {
      setLogo(uploading);
      setUploading(null);
    }, simulatedUploadMs);
    return () => window.clearTimeout(timer);
  }, [uploading]);

  return (
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
