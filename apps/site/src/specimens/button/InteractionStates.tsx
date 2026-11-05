import { Example, MatrixScroll } from '../../figures/Example';
import { controlStates } from '../../figures/ControlStates';
import { VariantButton, buttonVariants, pairName } from '../../figures/ButtonVariants';

/** Each variant forced into its hover, pressed, focus and disabled looks. */
export default function InteractionStates() {
  return (
    <Example size="wide" still>
      <MatrixScroll label="Button interaction states">
        <table className="catalogue-matrix">
          <thead>
            <tr>
              <th scope="col">Variant</th>
              {controlStates.map((state) => (
                <th scope="col" key={state.title}>
                  {state.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {buttonVariants
              .filter((example) => example.tone === 'neutral')
              .map((example) => (
                <tr key={pairName(example)}>
                  <th scope="row">{pairName(example)}</th>
                  {controlStates.map((state) => (
                    <td key={state.title}>
                      <VariantButton
                        example={example}
                        form="label"
                        className={state.className}
                        disabled={state.disabled}
                        inert
                      />
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </MatrixScroll>
    </Example>
  );
}
