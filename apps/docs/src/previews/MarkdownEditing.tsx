import { useEffect, useRef, useState } from 'react';
import { Button, Dialog, Stack } from '@envsemble/envui';
import { MarkdownEditor, type MarkdownLink } from '@envsemble/envui/content';
import { Example, Specimen, SpecimenGrid } from './Example';
import { Preview } from './Preview';

const editorSample = `## Project checklist

Prepare the **sample project** for review.

- Review the [draft document](/documents/draft).
- Confirm the outline before sharing the project.

Use ready-for-review as the status label.`;

const resources = [
  { label: 'Sample project', href: '/projects/sample' },
  { label: 'Draft document', href: '/documents/draft' },
  { label: 'Project checklist', href: '/documents/checklist' },
] satisfies MarkdownLink[];

/** Resource choices and picker state belong to the consumer, not the editor. */
function ResourceLinkEditor() {
  const [value, setValue] = useState('Review the draft before sharing the project.');
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
        variant="plain"
        label="Description"
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
          variant="plain"
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
              variant="plain"
              label="Published description"
              defaultValue="The review is **complete**."
              rows={3}
              readOnly
              toolbar={false}
              preview={false}
            />
          </Specimen>
          <Specimen title="Disabled">
            <MarkdownEditor
              variant="plain"
              label="Archived description"
              defaultValue="This document has been archived."
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
