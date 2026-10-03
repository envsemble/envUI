import { useEffect, useRef, useState } from 'react';
import { Button, Dialog, Stack } from '@envsemble/envui';
import { MarkdownEditor, type MarkdownLink } from '@envsemble/envui/content';
import { Example, Specimen, SpecimenGrid } from './Example';
import { Preview } from './Preview';

const editorSample = `## Release checklist

Prepare **Router A** for the autumn release.

- Review [job #42](/jobs/42).
- Confirm the backup before restarting the service.

Use \`release-ready\` as the status label.`;

const resources = [
  { label: 'Router A', href: '/devices/router-a' },
  { label: 'Job #42', href: '/jobs/42' },
  { label: 'Release checklist', href: '/documents/release-checklist' },
] satisfies MarkdownLink[];

/** Resource choices and picker state belong to the consumer, not the editor. */
function ResourceLinkEditor() {
  const [value, setValue] = useState('Review the device before starting the job.');
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const resolvePicker = useRef<((link: MarkdownLink | null) => void) | null>(null);
  useEffect(() => () => resolvePicker.current?.(null), []);

  function finish(link: MarkdownLink | null) {
    resolvePicker.current?.(link);
    resolvePicker.current = null;
    setSelectedText(null);
  }
  return (
    <>
      <MarkdownEditor
        label="Description"
        hint="Use Insert link to choose a resource from the application."
        rows={4}
        value={value}
        onValueChange={setValue}
        toolbar={['bold', 'italic', 'link']}
        onRequestLink={({ selectedText: selection }) => {
          setSelectedText(selection);
          return new Promise((resolve) => {
            resolvePicker.current = resolve;
          });
        }}
      />
      <Dialog
        title="Link to a resource"
        open={selectedText !== null}
        onOpenChange={(open) => {
          if (!open) finish(null);
        }}
      >
        <Stack>
          {resources.map((resource) => (
            <Button
              key={resource.href}
              variant="secondary"
              onClick={() => finish({ ...resource, label: selectedText || resource.label })}
            >
              {resource.label}
            </Button>
          ))}
        </Stack>
      </Dialog>
    </>
  );
}

export function MarkdownEditorPreview() {
  return (
    <Preview>
      <Example title="Formatting and preview">
        <MarkdownEditor
          label="Description"
          defaultValue={editorSample}
          previewProps={{ headingOffset: 1, codeCopyable: true }}
        />
      </Example>
      <Example title="Application link picker">
        <ResourceLinkEditor />
      </Example>
      <Example title="Field states" size="collection">
        <SpecimenGrid>
          <Specimen title="Read-only">
            <MarkdownEditor
              label="Published description"
              defaultValue="The backup is **complete**."
              rows={3}
              readOnly
              toolbar={false}
              preview={false}
            />
          </Specimen>
          <Specimen title="Disabled">
            <MarkdownEditor
              label="Archived description"
              defaultValue="This device has been archived."
              rows={3}
              disabled
              toolbar={false}
              preview={false}
            />
          </Specimen>
        </SpecimenGrid>
      </Example>
    </Preview>
  );
}
