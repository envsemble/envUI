import { Rating } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

const values = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

/** Every half step of a five-star rating, values kept within the scale, and right-to-left text. */
export default function HalfSteps() {
  return (
    <Example title="Half steps" size="collection">
      <SpecimenGrid size="compact">
        {values.map((value) => (
          <Specimen key={value} title={String(value)}>
            <Rating value={value} />
          </Specimen>
        ))}
        <Specimen title="Rounded" caption="4.3 shows as 4.5.">
          <Rating value={4.3} showValue />
        </Specimen>
        <Specimen title="Kept within" caption="7 on a five-star scale shows 5.">
          <Rating value={7} showValue />
        </Specimen>
        <Specimen title="Right to left" caption="The half star fills its right half.">
          <div dir="rtl">
            <Rating value={2.5} showValue />
          </div>
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}
