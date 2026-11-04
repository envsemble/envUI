import {
  Avatar,
  Button,
  Checkbox,
  Column,
  ConfirmDialog,
  Dialog,
  DialogClose,
  HoverCard,
  IconButton,
  Popover,
  Row,
  Sheet,
  Text,
  TextField,
  Tooltip,
} from '@envsemble/envui';
import { IconInfo } from '@envsemble/envui/icons/Info';
import { IconSettings } from '@envsemble/envui/icons/Settings';
import { Cell, Section, Stage, Strip } from './ContactSheetParts.js';

const dialogStage = { height: '20rem', width: '33rem' } as const;
/** Wide enough that a side sheet keeps its own width beside the page it covers. */
const sheetStage = { height: '18rem', width: '48rem' } as const;

function Dialogs() {
  // A decision: the built-in close button is the Cancel, and the primary action comes last.
  const actions = <Button>Rename</Button>;
  return (
    <Section name="Dialog and DialogClose">
      <Strip>
        <Cell caption="Center, md, actions">
          <Stage {...dialogStage}>
            <Dialog
              defaultOpen
              title="Rename project"
              description="Everyone sees the new name."
              closeLabel="Cancel"
              actions={actions}
            >
              <TextField label="Name" defaultValue="Northwind launch" />
            </Dialog>
          </Stage>
        </Cell>
        <Cell caption="Top, lg">
          <Stage height="22rem" width="48rem">
            <Dialog
              defaultOpen
              placement="top"
              width="lg"
              title="Invite people"
              closeLabel="Cancel"
              actions={<Button>Send invitations</Button>}
            >
              <Text>Invitations expire after seven days.</Text>
            </Dialog>
          </Stage>
        </Cell>
        <Cell caption="Pending">
          <Stage {...dialogStage}>
            <Dialog
              defaultOpen
              pending
              title="Rename project"
              closeLabel="Cancel"
              actions={actions}
            >
              <TextField label="Name" defaultValue="Northwind launch" />
            </Dialog>
          </Stage>
        </Cell>
        <Cell caption="Skeleton">
          <Stage {...dialogStage}>
            <Dialog
              defaultOpen
              skeleton
              title="Rename project"
              closeLabel="Cancel"
              actions={actions}
            >
              <TextField label="Name" defaultValue="Northwind launch" />
            </Dialog>
          </Stage>
        </Cell>
        <Cell caption="Close button: hover" force="hover" target="[role=dialog] button">
          <Stage {...dialogStage}>
            <Dialog defaultOpen title="Rename project" closeLabel="Close">
              <Text>The name shows in every link.</Text>
            </Dialog>
          </Stage>
        </Cell>
      </Strip>
    </Section>
  );
}

function Confirms() {
  return (
    <Section name="ConfirmDialog">
      <Strip>
        <Cell caption="Danger">
          <Stage {...dialogStage}>
            <ConfirmDialog
              defaultOpen
              tone="danger"
              title="Delete Northwind launch?"
              description="This deletes the project and its files. It can’t be undone."
              confirmLabel="Delete project"
              onConfirm={() => {}}
            />
          </Stage>
        </Cell>
        <Cell caption="Neutral, content">
          <Stage {...dialogStage}>
            <ConfirmDialog
              defaultOpen
              title="Leave without saving?"
              confirmLabel="Leave"
              onConfirm={() => {}}
            >
              <Checkbox label="Don’t ask again" />
            </ConfirmDialog>
          </Stage>
        </Cell>
        <Cell caption="Error">
          <Stage {...dialogStage}>
            <ConfirmDialog
              defaultOpen
              tone="danger"
              title="Delete Northwind launch?"
              confirmLabel="Delete project"
              error="The project couldn’t be deleted. Try again."
              onConfirm={() => {}}
            />
          </Stage>
        </Cell>
      </Strip>
    </Section>
  );
}

function Sheets() {
  const body = (
    <Column gap={3}>
      <Checkbox label="Active" defaultChecked />
      <Checkbox label="Paused" />
    </Column>
  );
  const actions = <DialogClose variant="primary">Show 12 projects</DialogClose>;
  return (
    <Section name="Sheet">
      <Strip label="Sides">
        {(['end', 'start'] as const).map((side) => (
          <Cell key={side} caption={side}>
            <Stage {...sheetStage}>
              <Sheet
                defaultOpen
                side={side}
                title="Filters"
                description="Projects in Northwind."
                closeLabel="Close filters"
                actions={actions}
              >
                {body}
              </Sheet>
            </Stage>
          </Cell>
        ))}
        <Cell caption="bottom">
          <Stage {...sheetStage}>
            <Sheet
              defaultOpen
              side="bottom"
              title="Filters"
              closeLabel="Close filters"
              actions={actions}
            >
              {body}
            </Sheet>
          </Stage>
        </Cell>
      </Strip>
      <Strip label="States">
        <Cell caption="Resizable, no close button">
          <Stage {...sheetStage}>
            <Sheet defaultOpen resizable closeButton={false} title="Details" aria-label="Details">
              {body}
            </Sheet>
          </Stage>
        </Cell>
        <Cell caption="Pending">
          <Stage {...sheetStage}>
            <Sheet defaultOpen pending title="Filters" closeLabel="Close filters" actions={actions}>
              {body}
            </Sheet>
          </Stage>
        </Cell>
        <Cell caption="Skeleton">
          <Stage {...sheetStage}>
            <Sheet
              defaultOpen
              skeleton
              title="Filters"
              closeLabel="Close filters"
              actions={actions}
            >
              {body}
            </Sheet>
          </Stage>
        </Cell>
      </Strip>
    </Section>
  );
}

function Popups() {
  const card = (
    <Row gap={3} align="center">
      <Avatar name="Priya Shah" size="lg" />
      <Column gap={1}>
        <Text variant="title" render={<span />}>
          Priya Shah
        </Text>
        <Text variant="body-sm" emphasis="muted">
          Design lead · Lisbon
        </Text>
      </Column>
    </Row>
  );
  return (
    <>
      <Section name="Popover">
        <Strip>
          <Cell caption="Title, md">
            <Stage height="16rem" width="24rem">
              <Popover
                defaultOpen
                align="start"
                title="Share link"
                trigger={<Button variant="outline">Share</Button>}
              >
                <TextField label="Link" defaultValue="https://example.com/p/42" readOnly />
              </Popover>
            </Stage>
          </Cell>
          <Cell caption="lg, no title">
            <Stage height="16rem" width="32rem">
              <Popover
                defaultOpen
                align="start"
                width="lg"
                aria-label="Details"
                trigger={<IconButton icon={<IconInfo />} aria-label="Details" />}
              >
                <Text>
                  Builds run on every push to the main branch and take about four minutes.
                </Text>
              </Popover>
            </Stage>
          </Cell>
          <Cell caption="Skeleton">
            <Stage height="16rem" width="24rem">
              <Popover
                defaultOpen
                skeleton
                align="start"
                title="Share link"
                trigger={<Button variant="outline">Share</Button>}
              >
                <Text>Loading the link and its settings.</Text>
              </Popover>
            </Stage>
          </Cell>
        </Strip>
      </Section>
      <Section name="HoverCard">
        <Strip>
          <Cell caption="md">
            <Stage height="14rem" width="24rem">
              <HoverCard defaultOpen align="start" trigger={<a href="#priya">@priya</a>}>
                {card}
              </HoverCard>
            </Stage>
          </Cell>
          <Cell caption="lg">
            <Stage height="14rem" width="32rem">
              <HoverCard defaultOpen align="start" width="lg" trigger={<a href="#priya">@priya</a>}>
                {card}
              </HoverCard>
            </Stage>
          </Cell>
          <Cell caption="Skeleton">
            <Stage height="14rem" width="24rem">
              <HoverCard defaultOpen skeleton align="start" trigger={<a href="#priya">@priya</a>}>
                {card}
              </HoverCard>
            </Stage>
          </Cell>
        </Strip>
      </Section>
      <Section name="Tooltip">
        <Strip>
          {(['top', 'bottom', 'inline-start', 'inline-end'] as const).map((side) => (
            <Cell key={side} caption={side}>
              <Stage height="8rem" width="16rem">
                <div style={{ display: 'grid', placeItems: 'center', blockSize: '100%' }}>
                  <Tooltip content="Settings" side={side} defaultOpen>
                    <IconButton icon={<IconSettings />} aria-label="Settings" />
                  </Tooltip>
                </div>
              </Stage>
            </Cell>
          ))}
          <Cell caption="Long text">
            <Stage height="8rem" width="20rem">
              <div style={{ display: 'grid', placeItems: 'center', blockSize: '100%' }}>
                <Tooltip content="Only owners can change billing; ask Alex Morgan." defaultOpen>
                  <Button variant="outline">Billing</Button>
                </Tooltip>
              </div>
            </Stage>
          </Cell>
        </Strip>
      </Section>
    </>
  );
}

export function OverlaysSheet() {
  return (
    <>
      <Dialogs />
      <Confirms />
      <Sheets />
      <Popups />
    </>
  );
}
