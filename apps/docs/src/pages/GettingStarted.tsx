import { useState } from 'react';
import { Button, Text, Stack } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Code, CodeBlock } from '@envsemble/envui/content';
import { setupCode, registryCode, installCode } from '../Reference';
import { PageViews } from '../PageViews';
import type { ReferenceView } from '../Documentation';
import { Preview } from '../previews/Preview';
import { Example } from '../previews/Example';

function GettingStartedUsage() {
  return (
    <div className="docs-article">
      <Stack as="section">
        <Text as="h2" variant="page-heading">
          Install the private package
        </Text>
        <Text variant="body" tone="muted">
          Use React 19 and a current browser. Configure access to envsemble’s GitHub Packages
          registry with a classic token that has <Code>read:packages</Code> and permission to read
          the package. Set <Code>NODE_AUTH_TOKEN</Code> in your shell or CI secret store.
        </Text>
        <CodeBlock language="ini">{registryCode}</CodeBlock>
        <Text variant="body" tone="muted">
          Commit registry routing and the environment placeholder in a project <Code>.npmrc</Code>.
          Keep the actual token in user configuration or environment variables.
        </Text>
        <CodeBlock language="sh">{installCode}</CodeBlock>
      </Stack>
      <Stack as="section">
        <Text as="h2" variant="page-heading">
          Render a component
        </Text>
        <Text variant="body" tone="muted">
          Import the stylesheet once and place content inside an explicit theme boundary. Inter,
          semantic tokens, branding and component styles are included.
        </Text>
        <CodeBlock language="tsx">{setupCode}</CodeBlock>
        <Text variant="body" tone="muted">
          Use <Code>theme="light"</Code> or <Code>theme="dark"</Code>. Your application owns the
          theme preference, persistence and routing. Import symbols explicitly from{' '}
          <Code>@envsemble/envui/icons/Name</Code>; components also accept custom React icons.
        </Text>
      </Stack>
      <Stack as="section" id="local-development">
        <Text as="h2" variant="page-heading">
          Local live development
        </Text>
        <Text variant="body" tone="muted">
          In the design-system repository, install dependencies and start the documentation
          workspace:
        </Text>
        <CodeBlock language="sh">{'npm install\nnpm run dev'}</CodeBlock>
        <Text variant="body" tone="muted">
          The running documentation consumes the library’s public exports through the local
          workspace. Library edits update the running preview without publishing or changing the
          version. Run <Code>npm run build</Code> to create the package and matching offline HTML.
        </Text>
        <Text variant="body" tone="muted">
          A future product can use a local workspace connection to the same package. Product
          integration is a separate task; products should import the implementation and stylesheet.
        </Text>
      </Stack>
      <Stack as="section" id="upgrading">
        <Text as="h2" variant="page-heading">
          Adopt an update
        </Text>
        <Text variant="body" tone="muted">
          Choose a published version intentionally, review its changelog and migration notes, and
          validate the application before releasing it.
        </Text>
        <CodeBlock language="sh">{'npm install @envsemble/envui@<version>'}</CodeBlock>
        <Text variant="body" tone="muted">
          Published versions are immutable. Compatible fixes and additions remain within the
          existing contract; breaking changes need a documented migration. The release includes an
          offline reference matching the package version.
        </Text>
      </Stack>
      <Stack as="section">
        <Text as="h2" variant="page-heading">
          For coding agents
        </Text>
        <Text variant="body" tone="muted">
          The package includes <Code>USAGE.md</Code>, generated from the same maintained reference
          as these Usage pages. Read it alongside the TypeScript declarations and release notes.
        </Text>
      </Stack>
    </div>
  );
}

function GettingStartedPreview() {
  const [created, setCreated] = useState(0);
  return (
    <Preview>
      <Example
        title="Your first component"
        caption="Requires React 19. Import the stylesheet once and wrap application content in a Theme boundary."
      >
        <Button startIcon={<Add />} onClick={() => setCreated((count) => count + 1)}>
          Create item
        </Button>
        {created > 0 && (
          <Text variant="caption" role="status">
            Created {created} example {created === 1 ? 'item' : 'items'}.
          </Text>
        )}
      </Example>
    </Preview>
  );
}

export function GettingStarted({ view }: { view: ReferenceView }) {
  return (
    <PageViews
      path="getting-started"
      title="Getting started"
      breadcrumb="envUI"
      view={view}
      preview={<GettingStartedPreview />}
      usage={<GettingStartedUsage />}
    />
  );
}
