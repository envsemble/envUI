import { Badge, Button, CounterBadge, DiffStat } from '@envsemble/envui';
import { Example } from '../../previews/Example';

const tones = [
  { tone: 'neutral', label: 'Archived' },
  { tone: 'accent', label: 'In review' },
  { tone: 'success', label: 'Ready' },
  { tone: 'warning', label: 'Blocked' },
  { tone: 'danger', label: 'Failed' },
  { tone: 'done', label: 'Completed' },
] as const;
const variants = ['subtle', 'solid', 'outline'] as const;

/** Every tone in every variant, and the counts on their own and in each kind of button. */
export default function VariantMatrix() {
  return (
    <>
      <Example title="Tones and variants" size="wide">
        <div
          className="docs-matrix-scroll"
          tabIndex={0}
          role="region"
          aria-label="Badge tones and variants"
        >
          <table className="docs-matrix">
            <thead>
              <tr>
                <th scope="col">Tone</th>
                {variants.map((variant) => (
                  <th scope="col" key={variant}>
                    {variant}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tones.map(({ tone, label }) => (
                <tr key={tone}>
                  <th scope="row">{tone}</th>
                  {variants.map((variant) => (
                    <td key={variant}>
                      <Badge tone={tone} variant={variant}>
                        {label}
                      </Badge>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Example>
      <Example title="Counts in buttons" size="wide">
        <div
          className="docs-matrix-scroll"
          tabIndex={0}
          role="region"
          aria-label="Counts in buttons"
        >
          <table className="docs-matrix">
            <thead>
              <tr>
                <th scope="col">Button</th>
                <th scope="col">Badge</th>
                <th scope="col">Counter</th>
                <th scope="col">Accent counter</th>
                <th scope="col">Diff stat</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">none</th>
                <td>
                  <Badge tone="accent">New</Badge>
                </td>
                <td>
                  <CounterBadge value={4} />
                </td>
                <td>
                  <CounterBadge value={12} tone="accent" />
                </td>
                <td>
                  <DiffStat additions={12} deletions={3} />
                </td>
              </tr>
              {(
                [
                  ['secondary', { variant: 'secondary' }],
                  ['outline', { variant: 'outline' }],
                  ['primary', { variant: 'primary' }],
                  ['primary · accent', { variant: 'primary', tone: 'accent' }],
                ] as const
              ).map(([name, emphasis]) => (
                <tr key={name}>
                  <th scope="row">{name}</th>
                  <td>
                    <Button {...emphasis}>
                      Plans <Badge tone="accent">New</Badge>
                    </Button>
                  </td>
                  <td>
                    <Button {...emphasis}>
                      Plans <CounterBadge value={4} />
                    </Button>
                  </td>
                  <td>
                    <Button {...emphasis}>
                      Inbox <CounterBadge value={12} tone="accent" />
                    </Button>
                  </td>
                  <td>
                    <Button {...emphasis}>
                      Changes <DiffStat additions={12} deletions={3} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Example>
    </>
  );
}
