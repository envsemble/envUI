// The palette contains foundations only. State colors are computed in Tokens.css.
const colorGroups = [
    ["Backgrounds", ["canvas", "pane", "surface-muted", "surface"]],
    ["Text & icons", ["text-primary", "text-strong", "text-muted", "control-text", "icon", "text-quiet"]],
    ["Controls", ["border-strong", "neutral-fill", "link", "control-blue", "accent"]],
    ["Feedback", ["destructive-action", "toast-success", "toast-info", "white"]],
    ["Loading", ["skeleton-base"]],
];
const colorNames = {
    "canvas": "Page background",
    "pane": "Background panes · grouped content",
    "surface-muted": "Rows, cards & circular buttons",
    "surface": "Alternate row fill & secondary buttons",
    "text-primary": "Headings & main text · light focus ring",
    "text-strong": "Strong text & primary button fill",
    "text-muted": "Supporting text",
    "control-text": "Secondary labels & circular icons",
    "icon": "Icons",
    "text-quiet": "Captions",
    "border-strong": "Control outlines",
    "link": "Links, navigation & radio selection",
    "control-blue": "Enabled toggles & checkboxes",
    "accent": "Important emphasis",
    "destructive-action": "Delete button & error toast fill",
    "neutral-fill": "Neutral toast fill",
    "toast-success": "Success toast fill",
    "toast-info": "Info toast fill",
    "white": "Text & icons on colored fills",
    "skeleton-base": "Loading placeholders",
};

const root = document.documentElement;
const probe = document.createElement("span");
probe.style.position = "absolute";
probe.style.visibility = "hidden";
document.body.append(probe);
function colorValue(token) {
    probe.style.backgroundColor = `var(--color-${token})`;
    return getComputedStyle(probe).backgroundColor;
}
function hex(value) {
    const rgb = value.match(/^rgba?\(([^)]+)\)/);
    if (rgb)
        return `#${rgb[1]
            .split(/[ ,/]+/)
            .slice(0, 3)
            .map((x) => Math.round(Number(x)).toString(16).padStart(2, "0"))
            .join("")}`.toUpperCase();
    const srgb = value.match(/^color\(srgb\s+([^)]+)\)/);
    if (srgb)
        return `#${srgb[1]
            .split(/[ ,/]+/)
            .slice(0, 3)
            .map((x) =>
                Math.round(Number(x) * 255)
                    .toString(16)
                    .padStart(2, "0"),
            )
            .join("")}`.toUpperCase();
    return value;
}
function hslValue(value) {
    const source = value.match(/^hsl\(([^)]+)\)$/);
    if (source) return value;
    const channels = value.match(/^rgba?\(([^)]+)\)/) || value.match(/^color\(srgb\s+([^)]+)\)/);
    const rgb = channels[1].split(/[ ,/]+/).slice(0, 3).map(Number);
    if (value.startsWith("rgb")) for (let i = 0; i < 3; i++) rgb[i] /= 255;
    const [r, g, b] = rgb;
    const max = Math.max(...rgb), min = Math.min(...rgb), delta = max - min;
    const lightness = (max + min) / 2;
    const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
    let hue = delta === 0 ? 0 : max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
    hue = (hue * 60 + 360) % 360;
    return `hsl(${Number(hue.toFixed(3))} ${Number((saturation * 100).toFixed(3))}% ${Number((lightness * 100).toFixed(3))}%)`;
}
const paletteLabels = {};

function readPalette(theme) {
    root.dataset.theme = theme;
    const colors = {};
    paletteLabels[theme] = {};
    for (const [, names] of colorGroups) for (const name of names) {
        colors[name] = colorValue(name);
        paletteLabels[theme][name] = getComputedStyle(root).getPropertyValue(`--color-${name}`).trim();
    }
    return colors;
}
const light = readPalette("light");
const dark = readPalette("dark");
root.dataset.theme = "light";
const table = document.getElementById("palette-table");
for (const [group, names] of colorGroups) {

    for (const name of names) {
        const row = document.createElement("div");
        row.className = "palette-row";
        const token = document.createElement("code");
        if (name === names[0]) {
            const heading = document.createElement("span");
            heading.className = "palette-category";
            heading.textContent = group;
            token.append(heading);
            row.classList.add("palette-category-start");
        }
        const tokenName = document.createElement("span");
        tokenName.textContent = colorNames[name];
        token.append(tokenName);
        row.append(token);
        for (const [theme, palette] of [["light", light], ["dark", dark]]) {
            const cell = document.createElement("div");
            cell.className = "swatch-value";
            cell.style.backgroundColor = palette[name];
            const resolvedHex = hex(palette[name]);
            const channels = resolvedHex
                .slice(1)
                .match(/.{2}/g)
                .map((channel) => {
                    const value = parseInt(channel, 16) / 255;
                    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
                });
            const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
            cell.style.color = luminance > 0.179 ? light["text-primary"] : light["white"];
            const value = document.createElement("code");
            value.textContent = hslValue(paletteLabels[theme][name]);
            cell.append(value);
            row.append(cell);
        }
        table.append(row);
    }
}
const spacing = [0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4];
document.getElementById("spacing-list").innerHTML = spacing.map((size, index) =>
    `<div class="measure"><span>Step ${index + 1}</span><span>${size} rem</span><div class="measure-bar" style="width:var(--space-${index + 1})"></div></div>`).join("");

const rowExamples = [
    ["Setting one", "Supporting detail"],
    ["Setting two", "Supporting detail"],
    ["Setting three", "Supporting detail"],
    ["Setting four", "Supporting detail"],
    ["Setting five", "Supporting detail"],
];
function renderGroupedRows() {
    const count = Number(document.getElementById("row-count").value);
    const content = rowExamples
        .slice(0, count)
        .map(
            ([name, description]) =>
                `<li><span>${name}<small>${description}</small></span><button class="button outlined" type="button" aria-label="Manage ${name.toLowerCase()}">Manage</button></li>`,
        )
        .join("");
    for (const id of ["row-demo", "row-demo-dark"]) {
        const list = document.getElementById(id);
        if (list) list.innerHTML = content;
    }
}
renderGroupedRows();
function controlMarkup(variant, state, label) {
    const navigation = variant.startsWith("navigation");
    const selected = variant === "navigation-selected";
    const iconOnly = variant === "icon-button";
    const classes = navigation ? `navigation-control ${selected ? "active" : ""}` : `button ${variant}`;
    const icon = navigation ? iconMarkup(`home${selected ? "_fill1" : ""}_24px.svg`) : iconOnly ? iconMarkup("chevron_right_24px.svg") : "";
    return `<button class="${classes} ${state}" type="button" ${state === "disabled" ? "disabled" : ""} ${selected ? 'aria-current="page"' : ""} ${iconOnly ? `aria-label="${label}"` : ""}>${icon}${iconOnly ? "" : label}</button>`;
}
const variants = [
    ["primary", "Primary", "Neutral emphasis", "Continue"],
    ["emphasis", "Important action", "Rare emphasis · 0.5 rem corners", "Confirm"],
    ["secondary", "Secondary", "Subtle fill", "Cancel"],
    ["outlined", "Outlined", "Blue label", "Manage"],
    ["danger", "Destructive", "Destructive action", "Delete"],
    ["icon-button", "Circular icon", "Tonal fill · 2.5 rem circle", "Next item"],
    ["navigation", "Navigation", "Quiet destination", "Home"],
    ["navigation-selected", "Selected navigation", "Active destination", "Home"],
];
document.getElementById("button-matrix").innerHTML = variants
    .map(
        ([variant, title, color, label]) =>
            `<tr><td>${title}<small>${color}</small></td>${["default", "hover", "pressed", "focus", "disabled"].map((state) => `<td>${controlMarkup(variant, state, label)}</td>`).join("")}</tr>`,
    )
    .join("");
document.getElementById("navigation-grid").innerHTML = [
    ["Default", ""],
    ["Selected destination", "active"],
    ["Keyboard focus", "focus"],
    ["Disabled", "disabled"],
]
    .map(
        ([label, state]) =>
            `<div class="board"><h3>${label}</h3>${controlMarkup(state === "active" ? "navigation-selected" : "navigation", state === "active" ? "default" : state, "Home")}</div>`,
    )
    .join("");
document.getElementById("icon-library").innerHTML = [
    "home",
    "category",
    "search",
    "settings",
    "add",
    "close",
    "check",
    "groups_3",
]
    .map(
        (name) =>
            `<div class="icon-pair"><div>${iconMarkup(`${name}_24px.svg`)}${iconMarkup(`${name}_fill1_24px.svg`)}</div><p class="caption">${({home:"Home",category:"Category",search:"Search",settings:"Settings",add:"Add",close:"Close",check:"Confirm",groups_3:"People"})[name]}<br>Outline / Filled</p></div>`,
    )
    .join("");

const main = document.querySelector(".gallery-main");
const comparison = document.createElement("div");
comparison.className = "theme-comparison";
const lightPreview = document.createElement("div");
lightPreview.className = "theme-preview";
lightPreview.dataset.theme = "light";
lightPreview.innerHTML = '<p class="theme-label">Light</p>';
for (const id of ["colors", "typography", "layout", "icons", "scale", "notes", "buttons", "forms", "navigation", "rows", "cards", "feedback", "dialogs"]) {
    lightPreview.append(document.getElementById(id));
}
const darkPreview = lightPreview.cloneNode(true);
darkPreview.dataset.theme = "dark";
darkPreview.querySelector(".theme-label").textContent = "Dark";
for (const element of darkPreview.querySelectorAll("[id]")) element.id += "-dark";
for (const element of darkPreview.querySelectorAll("[for]")) element.htmlFor += "-dark";
for (const input of darkPreview.querySelectorAll("input[type=radio][name]")) input.name += "-dark";
for (const element of darkPreview.querySelectorAll("[aria-describedby]")) {
    element.setAttribute("aria-describedby", element.getAttribute("aria-describedby").split(" ").map(id => id + "-dark").join(" "));
}
for (const element of darkPreview.querySelectorAll("[aria-labelledby]")) {
    element.setAttribute("aria-labelledby", element.getAttribute("aria-labelledby").split(" ").map(id => id + "-dark").join(" "));
}
for (const [preview, keepColumn] of [[lightPreview, 1], [darkPreview, 2]]) {
    const palette = preview.querySelector(".palette-table");
    const header = palette.querySelector(".palette-header");
    [...header.children].forEach((cell, index) => {
        if (index > 0 && index !== keepColumn) cell.remove();
    });
    header.lastElementChild.textContent = "Color";
    for (const row of palette.querySelectorAll(".palette-row")) {
        [...row.children].forEach((cell, index) => {
            if (index > 0 && index !== keepColumn) cell.remove();
        });
    }
}
for (const [preview, palette] of [[lightPreview, light], [darkPreview, dark]]) {
    for (const value of preview.querySelectorAll(".type-color-value")) {
        value.textContent = hslValue(paletteLabels[preview.dataset.theme][value.dataset.color]);
    }
}
comparison.style.setProperty("--section-count", lightPreview.children.length);
comparison.append(lightPreview, darkPreview);
main.append(comparison);
// Documentation values are read from the live theme, not copied numbers.
for (const preview of [lightPreview, darkPreview]) {
    const style = getComputedStyle(preview);
    const number = name => parseFloat(style.getPropertyValue(name));
    const format = value => Number(value.toFixed(3));
    for (const cell of preview.querySelectorAll("[data-state-value]")) {
        const delta = format(number(cell.dataset.stateValue));
        cell.textContent = delta;
    }
    for (const cell of preview.querySelectorAll("[data-dialog-overlay-opacity]")) cell.textContent = `${format(number("--state-dialog-overlay-opacity") * 100)}%`;
    for (const cell of preview.querySelectorAll("[data-disabled-opacity]")) cell.textContent = `${format(number("--state-disabled-opacity") * 100)}%`;
}

initializeToasts(comparison);
const leftSelections = [...lightPreview.querySelectorAll("select")];
const rightSelections = [...darkPreview.querySelectorAll("select")];
leftSelections.forEach((left, index) => {
    const right = rightSelections[index];
    for (const control of [left, right]) {
        control.addEventListener("change", () => {
            left.value = right.value = control.value;
            if (left.id === "row-count") renderGroupedRows();
        });
    }
});
initializeDropdowns(comparison);
initializeDialogs(comparison);
initializePairedInputs(comparison);
const leftNotes = [...lightPreview.querySelectorAll("details")];
const rightNotes = [...darkPreview.querySelectorAll("details")];
leftNotes.forEach((left, index) => {
    const right = rightNotes[index];
    for (const note of [left, right]) {
        note.addEventListener("toggle", () => {
            if (left.open !== note.open) left.open = note.open;
            if (right.open !== note.open) right.open = note.open;
        });
    }
});
const navigationIcons = {
    colors: "palette", typography: "text_fields", layout: "space_dashboard", icons: "apps",
    buttons: "touch_app", forms: "text_fields", navigation: "menu", rows: "view_list", notes: "apps", cards: "dashboard", feedback: "category", dialogs: "space_dashboard", scale: "devices",
};
for (const link of document.querySelectorAll(".gallery-nav a")) {
    link.dataset.icon = navigationIcons[link.hash.slice(1)];
    link.insertAdjacentHTML("afterbegin", iconMarkup(`${link.dataset.icon}_24px.svg`));
}
const sectionLinks = [...document.querySelectorAll(".gallery-nav a")];
const orderedSections = [...comparison.querySelectorAll("section[id]")];
function updateActiveSection() {
    const boundary = window.innerHeight * 0.25;
    let active = orderedSections[0];
    for (const section of orderedSections) {
        if (section.getBoundingClientRect().top <= boundary) active = section;
    }
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1) active = orderedSections.at(-1);
    for (const link of sectionLinks) {
        const selected = link.hash === "#" + active.id.replace(/-dark$/, "");
        link.classList.toggle("active", selected);
        link.querySelector("use").setAttribute("href", `#icon-${link.dataset.icon}${selected ? "_fill1" : ""}_24px`);
        if (selected) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
    }
}
let navigationFrame;
window.addEventListener("scroll", () => {
    if (navigationFrame) return;
    navigationFrame = requestAnimationFrame(() => { navigationFrame = null; updateActiveSection(); });
}, { passive: true });
window.addEventListener("resize", updateActiveSection);
updateActiveSection();
