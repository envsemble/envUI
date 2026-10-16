import { useState } from 'react';
import { ActionGroup, NavList } from '@envsemble/envui';
import { Apps } from '@envsemble/envui/icons/Apps';
import { Home } from '@envsemble/envui/icons/Home';
import { Example } from '../../previews/Example';

const sizes = ['standard', 'compact'] as const;
const forms = [
  { value: 'label', title: 'Label' },
  { value: 'icon', title: 'Icon + label' },
  { value: 'icon-only', title: 'Icon only' },
] as const;
const destinations = [
  { label: 'Home', icon: Home },
  { label: 'Projects', icon: Apps },
] as const;

/** Both sizes in every form: label only, icon and label, and icon only, for review. */
export default function VariantMatrix() {
  const [selected, setSelected] = useState('Home');
  return (
    <Example
      title="Sizes and forms"
      size="wide"
      caption="Selected items fill their Material icon automatically."
    >
      <div
        className="docs-matrix-scroll"
        tabIndex={0}
        role="region"
        aria-label="Navigation item sizes and icons"
      >
        <table className="docs-matrix">
          <thead>
            <tr>
              <th scope="col">Size</th>
              {forms.map((form) => (
                <th scope="col" key={form.value}>
                  {form.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sizes.map((size) => (
              <tr key={size}>
                <th scope="row">{size}</th>
                {forms.map((form) => (
                  <td key={form.value}>
                    <ActionGroup>
                      {destinations.map((destination) => {
                        const props = {
                          size,
                          selected: selected === destination.label,
                          onClick: () => setSelected(destination.label),
                        };
                        return form.value === 'icon-only' ? (
                          <NavList.Item
                            {...props}
                            key={destination.label}
                            iconOnly
                            icon={<destination.icon />}
                            aria-label={destination.label}
                          />
                        ) : (
                          <NavList.Item
                            {...props}
                            key={destination.label}
                            icon={form.value === 'icon' ? <destination.icon /> : undefined}
                          >
                            {destination.label}
                          </NavList.Item>
                        );
                      })}
                    </ActionGroup>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Example>
  );
}
