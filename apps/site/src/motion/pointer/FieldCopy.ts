/*
 * A copy of a field's text, laid over the field with the field's box and font, so that its text
 * sits exactly on the field's. It is used to paint a field's selection, which an unfocused field
 * doesn't paint (`.catalogue-field-selection`, Stage.css), and to measure where a character of the
 * field's value is (VirtualSelection.ts).
 */

/** A field whose text a drag selects. */
export type Field = HTMLInputElement | HTMLTextAreaElement;

/**
 * The properties a copy of a field's text takes from the field, so its text sits on the field's.
 */
const copied = [
  'boxSizing',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'fontStretch',
  'fontVariant',
  'fontFeatureSettings',
  'fontVariationSettings',
  'fontKerning',
  'letterSpacing',
  'wordSpacing',
  'lineHeight',
  'textAlign',
  'textIndent',
  'textTransform',
  'tabSize',
  'direction',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
] as const;

/**
 * Paints a field's selection over it: a copy of its text in the field's place and box, whose
 * selected part takes the selection's colours and whose rest is transparent, so the field shows
 * through. For a field in the stage's content, the copy goes first in the stage's overlay layer,
 * under whatever opens there, so a dialog and its backdrop cover it as they cover the field
 * (Stage.css hides it while a modal is open, which takes the field's focus). For a field inside
 * what opens there, such as a dialog, or in a stage without that layer, the copy goes in the box
 * the field is positioned in. The component's own elements are left as they are.
 */
export function paintField(
  field: Field,
  start: number,
  end: number,
  mirror: HTMLElement | null,
  scope: Element,
) {
  const copy = mirror ?? document.createElement('div');
  if (!mirror) {
    copy.className = 'catalogue-field-selection';
    copy.setAttribute('aria-hidden', 'true');
    copy.append(document.createElement('div'));
  }
  const overlays = scope.querySelector<HTMLElement>(':scope > .catalogue-overlay-layer');
  const layer = overlays && !overlays.contains(field) ? overlays : null;
  if (layer) {
    if (layer.firstChild !== copy) layer.prepend(copy);
  } else {
    // A field's offset parent is an HTML element.
    const holder = (field.offsetParent as HTMLElement | null) ?? scope;
    if (copy.parentElement !== holder) holder.append(copy);
  }
  shapeLike(copy, field);
  if (layer) {
    // In layout pixels, since the stage may be drawn scaled.
    const frame = layer.getBoundingClientRect();
    const box = field.getBoundingClientRect();
    const scale = frame.width / layer.offsetWidth || 1;
    copy.style.left = `${(box.left - frame.left) / scale - layer.clientLeft}px`;
    copy.style.top = `${(box.top - frame.top) / scale - layer.clientTop}px`;
  } else {
    copy.style.left = `${field.offsetLeft}px`;
    copy.style.top = `${field.offsetTop}px`;
  }
  const value = field.value;
  const selected = document.createElement('span');
  selected.textContent = value.slice(start, end);
  // The copy's one child holds its lines.
  (copy.firstElementChild as HTMLElement).replaceChildren(
    value.slice(0, start),
    selected,
    value.slice(end) || '​',
  );
  return copy;
}

/**
 * Gives a copy of a field's text the field's box, font and scroll, so its text sits on the field's.
 */
function shapeLike(copy: HTMLElement, field: Field) {
  const style = getComputedStyle(field);
  for (const property of copied) copy.style[property] = style[property];
  copy.style.borderStyle = 'solid';
  copy.style.borderColor = 'transparent';
  copy.style.width = `${field.offsetWidth}px`;
  copy.style.height = `${field.offsetHeight}px`;
  const area = field instanceof HTMLTextAreaElement;
  copy.dataset.field = area ? 'textarea' : 'input';
  // A textarea's scrollbar reduces the width its lines wrap in.
  if (area) {
    const scrollbar =
      field.offsetWidth -
      field.clientWidth -
      parseFloat(style.borderLeftWidth) -
      parseFloat(style.borderRightWidth);
    copy.style.paddingRight = `${parseFloat(style.paddingRight) + scrollbar}px`;
  }
  // The copy's one child holds its lines.
  const lines = copy.firstElementChild as HTMLElement;
  lines.style.transform = area
    ? `translateY(${-field.scrollTop}px)`
    : `translateX(${-field.scrollLeft}px)`;
}

/** The box of a character of a text in a field's value, measured on a hidden copy of its text. */
export function fieldCharacterBox(field: Field, text: string, along: (start: number) => number) {
  const start = text ? field.value.indexOf(text) : -1;
  if (start < 0) return null;
  const index = along(start);
  const copy = document.createElement('div');
  copy.className = 'catalogue-field-selection';
  copy.style.visibility = 'hidden';
  const lines = document.createElement('div');
  const character = document.createElement('span');
  character.textContent = field.value.charAt(index);
  lines.append(field.value.slice(0, index), character, field.value.slice(index + 1) || '​');
  copy.append(lines);
  // A field's offset parent is an HTML element.
  const holder = (field.offsetParent as HTMLElement | null) ?? field.parentElement;
  if (!holder) return null;
  holder.append(copy);
  shapeLike(copy, field);
  copy.style.left = `${field.offsetLeft}px`;
  copy.style.top = `${field.offsetTop}px`;
  const box = character.getBoundingClientRect();
  copy.remove();
  return box;
}
