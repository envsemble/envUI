import type { ReactNode } from 'react';
import { Alert, Button, EmptyState, Column, Row, Surface, Text, TextField } from '@envsemble/envui';
import { Example, ExampleStage } from '../Example';
import { VerdictFigure } from '../../template/Figures';

/** One rule as a pair: the wording to follow and the wording to avoid, with why. */
function Pair({
  title,
  rule,
  doing,
  doCaption,
  avoiding,
  avoidCaption,
}: {
  title: string;
  rule: string;
  doing: ReactNode;
  doCaption: string;
  avoiding: ReactNode;
  avoidCaption: string;
}) {
  return (
    // The do and don't figures have stages of their own.
    <ExampleStage value={false}>
      <Example title={title}>
        <Text emphasis="muted">{rule}</Text>
        <div className="docs-figure-run" data-count={2} data-verdicts>
          <VerdictFigure verdict="do" caption={doCaption}>
            {doing}
          </VerdictFigure>
          <VerdictFigure verdict="dont" caption={avoidCaption}>
            {avoiding}
          </VerdictFigure>
        </div>
      </Example>
    </ExampleStage>
  );
}

/** A confirmation's words, laid out as the dialog shows them, without opening one. */
function Confirmation({
  title,
  description,
  cancel,
  confirm,
}: {
  title: string;
  description: string;
  cancel: string;
  confirm: string;
}) {
  return (
    <Surface background="default" padding={5} radius="sm" render={<Column gap={4} />}>
      <Column gap={2}>
        <Text render={<p />} variant="title">
          {title}
        </Text>
        <Text emphasis="muted">{description}</Text>
      </Column>
      <Row wrap justify="end" gap={3}>
        <Button variant="secondary">{cancel}</Button>
        <Button tone="danger">{confirm}</Button>
      </Row>
    </Surface>
  );
}

export function ContentPreview() {
  return (
    <>
      <Pair
        title="Voice"
        rule="Plain, calm and direct: say what happened and what to do, without blame, apology or cheer."
        doing={
          <Alert tone="danger" title="Your changes weren’t saved">
            Check your connection and try again.
          </Alert>
        }
        doCaption="States the fact, says the work is not kept and gives the next step."
        avoiding={
          <Alert tone="danger" title="Oops! Something went wrong!">
            Please contact your administrator. Error code 500.
          </Alert>
        }
        avoidCaption="Exclamation marks, an apology and a code people can’t act on."
      />
      <Pair
        title="Buttons and actions"
        rule="A verb and its object, in sentence case, with the count when the action covers several things."
        doing={
          <Row wrap gap={3}>
            <Button variant="secondary">Cancel</Button>
            <Button tone="danger">Delete 3 documents</Button>
          </Row>
        }
        doCaption="The button says what it does and to how many."
        avoiding={
          <Row wrap gap={3}>
            <Button variant="secondary">No</Button>
            <Button>Yes, Delete Selected</Button>
          </Row>
        }
        avoidCaption="Yes and No send people back to the question; title case reads as shouting."
      />
      <Pair
        title="Labels and placeholders"
        rule="A short noun phrase as the label, guidance in the description, and the optional fields marked."
        doing={
          <TextField
            label="Phone number (optional)"
            description="For urgent changes to your bookings only."
            type="tel"
            autoComplete="tel"
          />
        }
        doCaption="The label stays visible; the description is read before people type."
        avoiding={
          <TextField
            label="Phone number"
            showLabel={false}
            placeholder="Enter your phone number here (optional)"
            type="tel"
          />
        }
        avoidCaption="The placeholder is the only label, and it disappears once people type."
      />
      <Pair
        title="Error messages"
        rule="Say how to fix the value, in the field’s own terms, without a prefix or blame."
        doing={
          <TextField
            label="Email address"
            type="email"
            defaultValue="sam.lee@"
            error="Enter an email address like name@example.com"
          />
        }
        doCaption="Starts with the fix and gives an example of a valid value."
        avoiding={
          <TextField
            label="Email address"
            type="email"
            defaultValue="sam.lee@"
            error="Error: you entered an invalid value!"
          />
        }
        avoidCaption="The tone and icon already say it is an error; this says nothing about the fix."
      />
      <Pair
        title="Empty states"
        rule="A title that states the fact, a sentence on why or what next, and one action."
        doing={
          <EmptyState
            headingLevel={3}
            title="No matching projects"
            description="No project names contain “roadmap”. Check the spelling or clear the filters."
            action={<Button variant="secondary">Clear filters</Button>}
          />
        }
        doCaption="Names the query and offers the way back."
        avoiding={
          <EmptyState
            headingLevel={3}
            title="Nothing here!"
            description="Looks like there’s nothing to show. Try something else, or start something new!"
            action={
              <Row wrap gap={3}>
                <Button>Create project</Button>
                <Button variant="secondary">Import</Button>
                <Button variant="secondary">Reset</Button>
              </Row>
            }
          />
        }
        avoidCaption="Doesn’t say why it is empty, and offers three competing ways out."
      />
      <Pair
        title="Confirmations"
        rule="Ask a question that names the object, state the consequence, and repeat the verb on the button."
        doing={
          <Confirmation
            title="Delete Website refresh?"
            description="This deletes the project and its 14 files for everyone. You can’t undo this."
            cancel="Cancel"
            confirm="Delete project"
          />
        }
        doCaption="The same verb from the question to the button; Cancel stays Cancel."
        avoiding={
          <Confirmation
            title="Are you sure?"
            description="This action cannot be undone."
            cancel="No"
            confirm="Yes"
          />
        }
        avoidCaption="Names nothing: people learn to press Yes without reading."
      />
    </>
  );
}
