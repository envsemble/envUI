import { Pager } from '@envsemble/envui';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

/** A pager at either end of a sequence, with one destination, centered without a placeholder. */
export default function SingleDestinations() {
  return (
    <Example title="Single destinations" size="collection">
      <SpecimenGrid size="wide">
        <Specimen title="First page, without an icon">
          <Pager.Root
            aria-label="Next only example"
            next={{ href: '/guide/overview', children: 'Getting started' }}
          />
        </Specimen>
        <Specimen title="Last page">
          <Pager.Root
            aria-label="Previous only example"
            previous={{ href: '/guide/invite', children: 'Invite your team', icon: <ArrowBack /> }}
          />
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}
