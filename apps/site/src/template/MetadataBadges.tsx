import type { ReactNode } from 'react';
import { Badge, Text } from '@envsemble/envui';
import type { DocumentationMetadata } from '../documentation/DocumentationTypes';
import { statusTones } from '../routes/PageBadges';

const isComponentName = (name: string) => /^[A-Z]/.test(name);

export function MetadataBadges({
  metadata,
  plain = false,
  children,
}: {
  metadata: Pick<DocumentationMetadata, 'status' | 'statuses' | 'since'>;
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
      {Object.entries(metadata.statuses ?? {})
        .filter(([name]) => !plain || isComponentName(name))
        .map(([name, status]) => (
          <Badge key={name} tone={statusTones[status]}>
            {`${name}: ${status[0].toUpperCase()}${status.slice(1)}`}
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
