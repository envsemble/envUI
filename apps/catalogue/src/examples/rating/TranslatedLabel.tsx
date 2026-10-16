import { Rating } from '@envsemble/envui';

/** The stars' accessible name in German, with the German decimal comma: "4,5 von 5 Sternen". */
const germanLabel = (value: number, max: number) =>
  `${value.toLocaleString('de')} von ${max} Sternen`;

export default function TranslatedLabel() {
  return <Rating lang="de" value={4.5} formatLabel={germanLabel} />;
}
