import { Spinner, Surface } from '@envsemble/envui';

export default function LoadingPreview() {
  return (
    // The preview's frame keeps its size while the file renders, with the spinner in its middle.
    <Surface tone="row" style={{ display: 'grid', placeItems: 'center', minBlockSize: '12rem' }}>
      <Spinner size="large" label="Loading the preview of quarterly-report.pdf" />
    </Surface>
  );
}
