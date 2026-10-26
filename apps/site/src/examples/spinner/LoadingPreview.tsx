import { Column, Spinner, Surface } from '@envsemble/envui';

export default function LoadingPreview() {
  return (
    // The preview's frame keeps its size while the file renders, with the spinner in its middle.
    <Surface background="muted" style={{ inlineSize: 'min(100%, 20rem)' }}>
      <Column align="center" justify="center" style={{ minBlockSize: '10rem' }}>
        <Spinner size="lg" label="Loading the preview of quarterly-report.pdf" />
      </Column>
    </Surface>
  );
}
