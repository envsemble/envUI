import { DropZone } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

const ignore = () => undefined;

/** The pending, invalid and disabled zones, standard and compact. */
export default function States() {
  return (
    <Example title="Drop zone states" size="collection">
      <SpecimenGrid>
        <Specimen title="Pending">
          <DropZone
            pending
            label="Uploading the logo"
            description="This takes a moment"
            onDropAccepted={ignore}
          />
        </Specimen>
        <Specimen title="Error">
          <DropZone
            label="Drop a cover image"
            accept="image/*"
            error="Choose an image at least 1200 pixels wide."
            onDropAccepted={ignore}
          />
        </Specimen>
        <Specimen title="Disabled">
          <DropZone disabled label="Uploads are paused" onDropAccepted={ignore} />
        </Specimen>
        <Specimen title="Compact, pending">
          <DropZone size="sm" pending label="Uploading 3 files" onDropAccepted={ignore} />
        </Specimen>
        <Specimen title="Compact, error">
          <DropZone
            size="sm"
            label="Attach documents"
            description="Any file, several at once"
            error="One file is larger than 25 MB."
            onDropAccepted={ignore}
          />
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}
