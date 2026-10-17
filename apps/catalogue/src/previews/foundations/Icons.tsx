import { IconCatalogue } from './IconCatalogue';

export function IconsPreview({
  onRequestUsage,
}: {
  onRequestUsage?: (name: string, filled: boolean) => void;
}) {
  return <IconCatalogue onRequestUsage={onRequestUsage} />;
}
