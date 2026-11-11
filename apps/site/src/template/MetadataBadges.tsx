import type { ReactNode } from 'react';
import { Badge, Text } from '@envsemble/envui';
import type { DocumentationMetadata } from '../documentation/DocumentationTypes';
import { statusTones } from '../routes/PageBadges';

/**
 * Status and first release under the title of a component's or pattern's page, and after them
 * `children`, such as the button to its counterpart in the catalogue or the Docs.
 */
export function MetadataBadges({
  metadata,
  plain = false,
  children,
}: {
  metadata: Pick<DocumentationMetadata, 'status' | 'statuses' | 'since'>;
  /** Leave out the statuses of exports that are code, such as a hook, as the catalogue does. */
  plain?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="site-page-meta">
      {metadata.status && (
        <Badge tone={statusTones[metadata.status]}>
          {metadata.status[0].toUpperCase() + metadata.status.slice(1)}
        </Badge>
      )}
      {/* In the catalogue, a component's status only: a hook or a function, such as
          useModifierKey, is code, which the catalogue never names; its page in the Docs shows
          its status. */}
      {Object.entries(metadata.statuses ?? {})
        .filter(([name]) => !plain || /^[A-Z]/.test(name))
        .map(([name, status]) => (
          <Badge key={name} tone={statusTones[status]}>
            {name}: {status[0].toUpperCase() + status.slice(1)}
          </Badge>
        ))}
      {metadata.since && (
        <Text render={<span />} variant="caption">
          Since {metadata.since}
        </Text>
      )}
      {children}
    </div>
  );
}
