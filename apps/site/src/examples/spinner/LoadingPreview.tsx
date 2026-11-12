import { useEffect, useState } from 'react';
import { Column, Spinner, Surface, Text } from '@envsemble/envui';

export default function LoadingPreview() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    // Stands in for rendering the file's first page.
    const rendering = setTimeout(() => setLoaded(true), 2000);
    return () => clearTimeout(rendering);
  }, []);
  return (
    // The preview's frame keeps its size while the file renders, with the spinner in its middle,
    // and the page takes the spinner's place.
    <Surface background="muted" aria-busy={!loaded} style={{ inlineSize: 'min(100%, 20rem)' }}>
      <Column align="center" justify="center" style={{ minBlockSize: '10rem' }}>
        {loaded ? (
          <Surface
            background="page"
            radius="sm"
            padding={3}
            render={<Column gap={1} />}
            aria-label="First page of quarterly-report.pdf"
            role="img"
            // A page's proportions, a little narrower than tall.
            style={{ inlineSize: '7.5rem', blockSize: '9.5rem' }}
          >
            <Text variant="caption">Quarterly report</Text>
            <Text variant="caption" emphasis="muted">
              Northwind · March 2026
            </Text>
          </Surface>
        ) : (
          <Spinner size="lg" label="Loading the preview of quarterly-report.pdf" />
        )}
      </Column>
    </Surface>
  );
}
