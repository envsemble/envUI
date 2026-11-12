// The devices dev mode's responsive frame offers, as browsers' responsive modes do: common phones,
// tablets, laptops and screens, each at its CSS viewport size in portrait, or landscape for the
// laptops and screens.

export interface Device {
  name: string;
  width: number;
  height: number;
}

export const deviceGroups: { label: string; devices: Device[] }[] = [
  {
    label: 'Phones',
    devices: [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 15', width: 393, height: 852 },
      { name: 'iPhone 15 Pro Max', width: 430, height: 932 },
      { name: 'Pixel 8', width: 412, height: 915 },
      { name: 'Galaxy S25', width: 360, height: 780 },
    ],
  },
  {
    label: 'Tablets',
    devices: [
      { name: 'iPad Mini', width: 744, height: 1133 },
      { name: 'iPad Air', width: 820, height: 1180 },
      { name: 'iPad Pro 11"', width: 834, height: 1194 },
      { name: 'iPad Pro 13"', width: 1024, height: 1366 },
      { name: 'Galaxy Tab S9', width: 800, height: 1280 },
    ],
  },
  {
    label: 'Laptops and screens',
    devices: [
      { name: 'Laptop', width: 1280, height: 800 },
      { name: 'Laptop HiDPI', width: 1440, height: 900 },
      { name: 'Full HD', width: 1920, height: 1080 },
    ],
  },
];
