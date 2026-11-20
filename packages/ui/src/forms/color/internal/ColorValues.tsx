'use client';

import type { ReactNode } from 'react';
import type { Color } from '@react-stately/color';
import { CopyButton } from '../../../actions/CopyButton.js';
import { Button } from '../../../actions/Button.js';
import { colorPicker as colorPickerMessages } from '../../../foundations/messages/colorPicker.js';
import { IconExpandMore } from '../../../icons/ExpandMore.js';
import { useMessages } from '../../../internal/provider/EnvUIContext.js';
import { flag } from '../../../internal/flag.js';
import * as Menu from '../../../actions/menu/Menu.js';
import { ColorFields } from './ColorFields.js';
import { displayColor, type ColorFormat } from './colorValue.js';
import '../../../styles/Base.css';
import '../../../styles/ColorPicker.css';

export function ColorValues({
  color,
  onChange,
  formats,
  oneAtATimeFormat: format,
  onFormatChange,
  together,
  alpha,
  copyable,
  eyeDropperButton,
  disabled,
  readOnly,
}: {
  color: Color;
  onChange: (color: Color) => void;
  formats: readonly ColorFormat[];
  oneAtATimeFormat: ColorFormat;
  onFormatChange: (format: ColorFormat) => void;
  together: boolean;
  alpha: boolean;
  copyable: boolean;
  eyeDropperButton: ReactNode;
  disabled: boolean;
  readOnly: boolean;
}) {
  const messages = useMessages('colorPicker', colorPickerMessages);
  const channelLetters = {
    red: messages.redShort,
    green: messages.greenShort,
    blue: messages.blueShort,
    hue: messages.hueShort,
    saturation: messages.saturationShort,
    lightness: messages.lightnessShort,
    alpha: messages.alphaShort,
  };
  const fields = (each: ColorFormat) => (
    <ColorFields
      format={each}
      alpha={alpha}
      hexLabel={messages.hexField}
      channelLetters={channelLetters}
      value={color}
      onChange={onChange}
      disabled={disabled}
      readOnly={readOnly}
    />
  );
  const copy = (each: ColorFormat, label: string) =>
    copyable && (
      <div className="env-color-picker-copy">
        <CopyButton
          variant="ghost"
          size="sm"
          aria-label={label}
          value={() => displayColor(color, each)}
          disabled={disabled}
        />
      </div>
    );
  if (together)
    return (
      <div
        className="env-color-picker-values"
        data-formats="together"
        data-alpha={flag(alpha)}
        data-eye-dropper={flag(eyeDropperButton)}
      >
        {formats.map((each, index) => (
          <div
            key={each}
            role="group"
            aria-label={messages[each]}
            className="env-color-picker-row"
            data-format={each}
          >
            {fields(each)}
            {index === 0 && eyeDropperButton}
            {copy(each, messages.copyFormat({ format: messages[each] }))}
          </div>
        ))}
      </div>
    );
  return (
    <div className="env-color-picker-values" data-format={format} data-alpha={flag(alpha)}>
      {formats.length > 1 && (
        <div className="env-color-picker-format">
          <Menu.Root
            aria-label={messages.format}
            align="start"
            trigger={
              <Button
                variant="ghost"
                size="sm"
                endIcon={<IconExpandMore />}
                disabled={disabled}
                aria-label={messages.formatButton({ format: messages[format] })}
              >
                {messages[format]}
              </Button>
            }
          >
            <Menu.RadioGroup
              value={format}
              onValueChange={(next) => onFormatChange(next as ColorFormat)}
            >
              {formats.map((each) => (
                <Menu.RadioItem key={each} value={each}>
                  {messages[each]}
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
          </Menu.Root>
        </div>
      )}
      {fields(format)}
      {eyeDropperButton}
      {copy(format, messages.copy)}
    </div>
  );
}
