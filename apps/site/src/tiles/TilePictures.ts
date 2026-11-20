import type { StageFill } from '../documentation/DocumentationTypes';
import { groupedPages } from '../routes/SiteRoutes';
import type { DocumentSummary } from '../routes/PageModel';
import { hasFoundationTile } from './foundations/FoundationTiles';
import { memberTileOf, tileOf, type TileModule } from './Tiles';

export interface TilePicture {
  page: string;
  name: string;
  open: boolean;
  stage?: StageFill;
  foundation?: string;
  tile?: () => Promise<TileModule>;
}

const squash = (text: string) => text.toLowerCase().replace(/[^a-z\d]/g, '');

const memberExamples: Record<string, string> = {
  IconButton: 'Icons',
  CopyButton: 'CopyValue',
};

export function tilePictureOf(
  document: DocumentSummary,
  component?: string,
): TilePicture | undefined {
  const secondaryExport = component && document.metadata?.components[0] !== component.split('.')[0];
  const tile = !secondaryExport && tileOf(document.id);
  const blocks = (document.outline ?? []).flatMap((section) => section.examples);
  const lead = document.outline
    ?.find((section) => section.id === 'overview')
    ?.examples.find((block) => !block.role);
  if (tile)
    return {
      page: document.id,
      name: document.id,
      open: true,
      tile,
    };
  const memberTile = secondaryExport && component ? memberTileOf(component) : undefined;
  if (memberTile && component)
    return {
      page: document.id,
      name: component,
      open: true,
      tile: memberTile,
    };
  const anatomy = blocks.find((block) => block.role === 'anatomy');
  const member = secondaryExport && component ? memberExamples[component] : undefined;
  const named =
    secondaryExport &&
    (blocks.find((block) => !block.role && block.name === member) ??
      blocks.find(
        (block) =>
          !block.role &&
          !block.widths &&
          [block.name, block.heading].some((text) => squash(text).includes(squash(component))),
      ));
  const chosen = named || (!secondaryExport && anatomy?.open ? anatomy : lead);
  if (!chosen)
    return hasFoundationTile(document.id)
      ? { page: document.id, name: document.id, open: false, foundation: document.id }
      : undefined;
  return {
    page: document.id,
    name: chosen.name,
    open: Boolean(chosen.open),
    stage: chosen.stage,
  };
}

export function ownsFrame(id?: string): boolean {
  return groupedPages.some((page) => page.document.id === id && page.section === 'Components');
}
