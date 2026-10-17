import {
  BrandLogo,
  ClickableCard,
  InfoChip,
  type InfoChipProps,
  type SegmentedControlOption,
} from '@envsemble/envui';

export const options: SegmentedControlOption[] = [{ value: 'open', label: 'Open' }];
export const chipProps: InfoChipProps = { children: 'Current plan' };

export const Header = () => (
  <>
    <BrandLogo />
    <ClickableCard href="/projects">Projects</ClickableCard>
    <InfoChip {...chipProps} />
  </>
);
