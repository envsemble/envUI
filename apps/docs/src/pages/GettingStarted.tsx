import { CodeBlock, Text, Stack } from '@envsemble/envui';
import { setupCode, registryCode, installCode } from '../Reference';

export function GettingStarted() {
  return (
    <div className="docs-article">
      <Stack as="section">
        <Text as="h2" variant="page-heading">
          Using this reference
        </Text>
        <Text variant="body" tone="muted">
          Preview shows interactive examples; the theme button switches their appearance. Guidelines
          explain design and behavior. Usage covers React imports, props and state ownership. The
          downloaded reference works offline.
        </Text>
        <Text variant="body" tone="muted">
          <a href="#/getting-started?section=local-development">Local live development</a> ·{' '}
          <a href="#/getting-started?section=upgrading">Version updates</a>
        </Text>
      </Stack>
      <Stack as="section">
        <Text as="h2" variant="page-heading">
          Install the private package
        </Text>
        <Text variant="body" tone="muted">
          Use React 19 and a current browser. Configure access to envsemble’s GitHub Packages
          registry with a classic token that has <CodeBlock language="tsx">read:packages</CodeBlock>{' '}
          and permission to read the package. Set{' '}
          <CodeBlock language="tsx">NODE_AUTH_TOKEN</CodeBlock> in your shell or CI secret store.
        </Text>
        <CodeBlock language="ini">{registryCode}</CodeBlock>
        <Text variant="body" tone="muted">
          Commit registry routing and the environment placeholder in a project{' '}
          <CodeBlock language="tsx">.npmrc</CodeBlock>. Keep the actual token in user configuration
          or environment variables.
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
          Use <CodeBlock language="tsx">theme="light"</CodeBlock> or{' '}
          <CodeBlock language="tsx">theme="dark"</CodeBlock>. Your application owns the theme
          preference, persistence and routing. Import symbols explicitly from{' '}
          <CodeBlock language="tsx">@envsemble/envui/icons/Name</CodeBlock>; components also accept
          custom React icons.
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
          version. Run <CodeBlock language="tsx">npm run build</CodeBlock> to create the package and
          matching offline HTML.
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
          The package includes <CodeBlock language="tsx">USAGE.md</CodeBlock>, generated from the
          same maintained reference as these Usage pages. Read it alongside the TypeScript
          declarations and release notes.
        </Text>
      </Stack>
    </div>
  );
}
