import type { Reference } from './Types';

export const layoutReferences: Reference[] = [
  {
    id: 'layout',
    title: 'Stacks & action groups',
    group: 'Layout & surfaces',
    summary: 'Use Stack for related content and ActionGroup for buttons.',
    example: `import { Card, Stack, ActionGroup, Input, Button, Text } from '@envsemble/envui';

<Card>
  <Text as="h3" variant="section-heading">Project details</Text>
  <Text>Cards space their direct children automatically.</Text>
  <Stack gap={4}>
    <Input label="Name" name="name" />
    <Input label="Description" name="description" />
  </Stack>
  <ActionGroup>
    <Button variant="secondary">Cancel</Button>
    <Button>Save changes</Button>
  </ActionGroup>
</Card>

<ActionGroup stacked>
  <Button>Continue</Button>
  <Button variant="secondary">Cancel</Button>
</ActionGroup>`,
    props: [
      ['Stack gap', 'Spacing step 0–9; default 4 (1 rem); 0 removes the gap'],
      ['Stack align', 'start, center, end or stretch (default)'],
      [
        'Stack as',
        'Semantic container tag; div (default), section, article, nav, main, aside, header or footer',
      ],
      [
        'Stack render',
        'Compose layout onto another root; set the semantic tag on the supplied element instead of as',
      ],
      ['ActionGroup stacked', 'Wrapped row by default; stacked label buttons fill the group'],
      ['ActionGroup align', 'Row alignment: start (default), center or end'],
      ['ActionGroup as', 'Semantic container tag; div by default, footer for card or form actions'],
      ['Native element props', 'children, className, style, ref and accessible attributes'],
    ],
    guidelines: [
      'The parent owns space between components; components own their internal padding. Avoid individual child margins.',
      'Stack uses the shared spacing scale. Step 4 is 1 rem; step 2 is 0.5 rem. Cards already space direct children by 1 rem.',
      'ActionGroup uses 1 rem gaps in wrapped rows and 0.5 rem when stacked. Circular icon buttons keep their size.',
      'With Stack render, put the semantic tag on the supplied element. Custom components must forward native props and refs.',
    ],
    related: ['spacing', 'surface', 'cards', 'responsive'],
  },
  {
    id: 'surface',
    title: 'Surface',
    group: 'Layout & surfaces',
    summary: 'A background pane without automatic spacing between children.',
    example: `import { Surface, Stack, Text } from '@envsemble/envui';

<Surface tone="pane" padding={5} render={<Stack as="section" gap={5} />}>
  <Text as="h2" variant="section-heading">Workspace pane</Text>
  <Text tone="muted">Stack supplies the content layout on the same root.</Text>
</Surface>`,
    props: [
      ['tone', 'pane (default), row, canvas or alternate'],
      ['padding', 'Spacing step 0–9; omitted uses responsive 1–1.5 rem padding'],
      ['corners', 'surface (default, 1.75 rem), standard (0.5 rem), pill or none'],
      ['as', 'Native container tag; div by default, with the semantic tags supported by Stack'],
      ['render', 'Optional root composition; set the tag on the supplied element instead of as'],
      ['Native element props', 'children, ref, className, style and accessible attributes'],
    ],
    guidelines: [
      'Surface supplies fill, padding and corners without layout, gaps, margins or interaction.',
      'Use Surface for plain panes, Card for content surfaces with standard layout, and specialized cards for their specific composition. Card builds on Surface.',
      'Stack and ActionGroup own layout. Compose Stack through render when the surface itself should arrange its content.',
      'Use surface corners for ordinary panes; standard and pill shapes serve the documented compact controls and rails. Custom render components must forward native props and refs.',
    ],
    related: ['spacing', 'layout', 'cards', 'colors'],
  },
  {
    id: 'rows',
    title: 'Grouped rows',
    group: 'Layout & surfaces',
    summary: 'Group related items with shared outer corners.',
    example: `import { GroupedRows, Row, Button } from '@envsemble/envui';

<GroupedRows>
  <Row title="Notifications" detail="Delivery preferences"
    action={<Button variant="outlined">Manage</Button>} />
  <Row title="Members" detail="Workspace access" />
</GroupedRows>`,
    props: [
      ['GroupedRows contrast', 'Use alternate fill inside a muted pane'],
      ['Row title / detail / action', 'General React content'],
      ['Native container props', 'className and accessible attributes'],
    ],
    guidelines: [
      'One row uses the full 1.75 rem outer radius. Multiple rows keep large outer corners and 0.5 rem inner corners.',
      'Rows have a 3.5 rem minimum height and a 0.125 rem gap. In a muted pane, use contrast fill to distinguish the rows.',
      'Keep actions short and let long titles and details wrap.',
    ],
    related: ['surface', 'cards', 'radio', 'select', 'spacing'],
  },
  {
    id: 'cards',
    title: 'Cards',
    group: 'Layout & surfaces',
    summary: 'A content surface with automatic spacing and optional actions.',
    example: `import { Card, FeatureCard, Button, Text } from '@envsemble/envui';
import { Apps } from '@envsemble/envui/icons/Apps';

<Card href="/projects" aria-labelledby="projects-title">
  <Text as="h3" variant="section-heading" id="projects-title">Projects</Text>
  <Text>Open your shared workspace.</Text>
</Card>

<Card as="button" onClick={openProject}>
  <span>Open project</span>
</Card>

<FeatureCard icon={<Apps />} title="Connected workspace"
  description="Bring your team and tools together."
  action={<Button>Explore</Button>} />

<Card as="article" heading="Project overview" meta="Updated today"
  actions={<Button variant="outlined">Open project</Button>}>
  Shared context for the next release.
</Card>`,
    props: [
      ['Card tone / padding', 'row (default), pane or canvas; optional fixed spacing step 0–9'],
      ['Card as / href', 'div (default), article or button; href renders a native link'],
      ['Card heading / meta / actions', 'Content-card slots; actions adds a footer strip'],
      ['Card layout', 'content (default) or action; actions automatically selects action layout'],
      [
        'ClickableCard',
        'Compatibility wrapper for Card href / Card as="button"; native action props and disabled',
      ],
      ['ActionCard', 'Compatibility wrapper for Card action layout; title maps to heading'],
      ['FeatureCard', 'icon, title, description, action'],
    ],
    guidelines: [
      'Use 1.75 rem corners. Row tone is the standalone card fill; pane tone groups content in a quieter background.',
      'Cards space direct children by 1 rem. FeatureCard keeps compact title/description spacing and separates additional content by 1 rem.',
      'Card composes Surface and Stack on one root. FeatureCard, ActionCard and ClickableCard reuse that card implementation.',
      'Use Card href for a single destination or Card as="button" for an action. Do not nest controls inside an interactive card. Use phrasing content such as spans in button cards.',
      'Interactive cards share the same surface, padding and corners. Hover and pressed derive from the chosen tone; keyboard focus and disabled behavior are shared. Label rich links with aria-labelledby and connect descriptions with aria-describedby.',
      'The action strip derives its fill from the parent surface. Compose actions from the shared controls.',
      'Titles, metadata and product data remain application content.',
    ],
    related: ['surface', 'layout', 'rows', 'typography'],
  },
];
