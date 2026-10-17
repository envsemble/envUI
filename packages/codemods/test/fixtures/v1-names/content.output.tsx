import {
  BrandLogo,
  Card,
  Badge,
  type BadgeProps,
  type SegmentedControlItem,
} from '@envsemble/envui';

export const options: SegmentedControlItem[] = [{ value: 'open', label: 'Open' }];
export const chipProps: BadgeProps = { children: 'Current plan' };

export const Header = () => (
  <>
    <BrandLogo />
    <Card href="/projects">Projects</Card>
    <Badge {...chipProps} />
  </>
);
