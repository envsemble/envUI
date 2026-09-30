function iconMarkup(name) { return `<span class="symbol" aria-hidden="true"><svg><use href="#icon-${name.replace(".svg", "")}"></use></svg></span>`; }

/* Reusable native-input, dropdown, and dialog behaviors. No gallery assembly. */
function initializeDropdowns(container) {
    // Keep the native select as the value source; enhance its presentation.
    const dropdowns = [];
    for (const [index, select] of [...container.querySelectorAll("select")].entries()) {
        const label = select.labels[0] || select.closest("label");
        const name = select.getAttribute("aria-label") || label?.textContent.replace(select.textContent, "").trim() || "Choose an option";
        const wrapper = document.createElement("span");
        wrapper.className = "dropdown-control";
        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "button dropdown-trigger";
        trigger.disabled = select.disabled;
        trigger.setAttribute("aria-haspopup", "listbox");
        trigger.setAttribute("aria-expanded", "false");
        const menu = document.createElement("span");
        menu.className = "dropdown-options";
        menu.id = `dropdown-options-${index}`;
        menu.setAttribute("role", "listbox");
        menu.setAttribute("aria-label", name);
        menu.hidden = true;
        trigger.setAttribute("aria-controls", menu.id);
        const items = [...select.options].map(option => {
            const item = document.createElement("button");
            item.type = "button";
            item.className = "dropdown-option";
            item.setAttribute("role", "option");
            item.tabIndex = -1;
            item.textContent = option.textContent;
            item.disabled = option.disabled;
            menu.append(item);
            return item;
        });
        const refresh = () => {
            trigger.innerHTML = `<span></span>${iconMarkup("chevron_right_24px.svg")}`;
            trigger.firstElementChild.textContent = select.selectedOptions[0].textContent;
            trigger.setAttribute("aria-label", `${name}: ${select.selectedOptions[0].textContent}`);
            items.forEach((item, i) => item.setAttribute("aria-selected", String(i === select.selectedIndex)));
        };
        const close = (focus = false) => {
            menu.hidden = true;
            trigger.setAttribute("aria-expanded", "false");
            if (focus) trigger.focus();
        };
        const enabledPosition = (position, direction = 1) => {
            for (let count = 0; count < items.length; count++) {
                const index = (position + count * direction + items.length * 2) % items.length;
                if (!items[index].disabled) return index;
            }
            return -1;
        };
        const open = (position = select.selectedIndex) => {
            position = enabledPosition(position);
            if (position === -1 || select.disabled) return;
            dropdowns.forEach(dropdown => dropdown.close());
            menu.hidden = false;
            trigger.setAttribute("aria-expanded", "true");
            items[position].focus();
        };
        trigger.addEventListener("click", event => {
            event.preventDefault();
            menu.hidden ? open() : close();
        });
        trigger.addEventListener("keydown", event => {
            if (["ArrowDown", "ArrowUp"].includes(event.key)) {
                event.preventDefault();
                open(event.key === "ArrowUp" ? items.length - 1 : select.selectedIndex);
            }
        });
        items.forEach((item, i) => {
            item.addEventListener("click", event => {
                event.preventDefault();
                select.selectedIndex = i;
                select.dispatchEvent(new Event("change", { bubbles: true }));
                dropdowns.forEach(dropdown => dropdown.refresh());
                close(true);
            });
            item.addEventListener("keydown", event => {
                let next;
                if (event.key === "ArrowDown") next = (i + 1) % items.length;
                if (event.key === "ArrowUp") next = (i - 1 + items.length) % items.length;
                if (event.key === "Home") next = 0;
                if (event.key === "End") next = items.length - 1;
                if (next !== undefined) { event.preventDefault(); const target = enabledPosition(next, event.key === "ArrowUp" || event.key === "End" ? -1 : 1); if (target !== -1) items[target].focus(); }
                else if (event.key === "Escape") { event.preventDefault(); close(true); }
                else if (event.key === "Tab") close();
                else if (event.key.length === 1 && event.key !== " ") {
                    const match = items.findIndex((candidate, j) => j > i && !candidate.disabled && candidate.textContent.toLowerCase().startsWith(event.key.toLowerCase()));
                    const first = items.findIndex(candidate => !candidate.disabled && candidate.textContent.toLowerCase().startsWith(event.key.toLowerCase()));
                    if (first !== -1) { event.preventDefault(); items[match === -1 ? first : match].focus(); }
                }
            });
        });
        wrapper.addEventListener("focusout", event => { if (!wrapper.contains(event.relatedTarget)) close(); });
        select.after(wrapper);
        wrapper.append(trigger, menu);
        select.hidden = true;
        select.addEventListener("change", () => dropdowns.forEach(dropdown => dropdown.refresh()));
        dropdowns.push({ wrapper, close, refresh });
        refresh();
    }
    document.addEventListener("pointerdown", event => dropdowns.forEach(dropdown => {
        if (!dropdown.wrapper.contains(event.target)) dropdown.close();
    }));
}

function initializeDialogs(container) {
    for (const [index, example] of [...container.querySelectorAll(".dialog-example")].entries()) {
        const specimen = example.querySelector(".dialog-specimen");
        const dialog = document.createElement("dialog");
        dialog.className = "modal-pane";
        const content = specimen.cloneNode(true);
        content.classList.remove("dialog-specimen");
        content.classList.add("dialog-content");
        const heading = content.querySelector("h4");
        heading.id = `modal-title-${index}`;
        dialog.setAttribute("aria-labelledby", heading.id);
        const description = content.querySelector("p");
        if (description) {
            description.id = `modal-description-${index}`;
            dialog.setAttribute("aria-describedby", description.id);
        }
        // Modal edits are separate from the illustrative paired field values.
        content.querySelectorAll("[data-paired-text]").forEach(input => input.removeAttribute("data-paired-text"));
        for (const action of content.querySelectorAll("[data-dialog-action]")) {
            const button = document.createElement("button");
            button.className = action.className;
            button.textContent = action.textContent;
            button.type = "button";
            button.dataset.dialogAction = action.dataset.dialogAction;
            button.addEventListener("click", () => dialog.close(button.dataset.dialogAction));
            action.replaceWith(button);
        }
        dialog.append(content);
        example.append(dialog);
        const launch = example.querySelector(".dialog-launch");
        launch.addEventListener("click", () => {
            const originalFields = [...specimen.querySelectorAll("input, textarea")];
            content.querySelectorAll("input, textarea").forEach((field, index) => { field.value = originalFields[index].value; });
            dialog.showModal();
            const focusTarget = content.querySelector("input") || content.querySelector('[data-dialog-action="cancel"]');
            focusTarget.focus();
        });
        dialog.addEventListener("close", () => launch.focus());
        if (specimen.dataset.dialogKind === "confirmation") {
            dialog.addEventListener("click", event => {
                if (event.target !== dialog) return;
                const rect = dialog.getBoundingClientRect();
                if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close("cancel");
            });
        }
    }
}

function initializePairedInputs(container) {
    for (const input of container.querySelectorAll("[data-indeterminate]")) input.indeterminate = true;
    for (const reset of container.querySelectorAll(".checkbox-reset")) {
        reset.addEventListener("click", () => {
            for (const input of container.querySelectorAll("[data-indeterminate]")) {
                input.checked = false;
                input.indeterminate = true;
            }
        });
    }

    for (const input of container.querySelectorAll("[data-paired-text]")) {
        input.addEventListener("input", () => {
            container.querySelectorAll(`[data-paired-text="${input.dataset.pairedText}"]`).forEach(counterpart => {
                counterpart.value = input.value;
            });
        });
    }
    for (const input of container.querySelectorAll("[data-paired-control]")) {
        input.addEventListener("change", () => {
            const preview = input.closest(".theme-preview");
            const sources = input.type === "radio"
                ? [...preview.querySelectorAll("input[type=radio]")].filter(candidate => candidate.name === input.name)
                : [input];
            for (const source of sources) {
                for (const counterpart of container.querySelectorAll(`[data-paired-control="${source.dataset.pairedControl}"]`)) {
                    counterpart.checked = source.checked;
                    counterpart.indeterminate = source.indeterminate;
                }
            }
        });
    }
}


function initializeToasts(container) {
    for (const close of container.querySelectorAll(".toast-dismiss")) {
        close.addEventListener("click", () => {
            const key = close.closest(".toast").dataset.toast;
            container.querySelectorAll(`[data-toast="${key}"]`).forEach(toast => { toast.style.visibility = "hidden"; });
        });
    }
    for (const reset of container.querySelectorAll(".toast-reset")) {
        reset.addEventListener("click", () => container.querySelectorAll(".toast").forEach(toast => { toast.style.visibility = ""; }));
    }
}
