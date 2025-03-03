import { updateDivs } from "./common.ts"

function moveBreadcrumbs(elements: HTMLElement[]): void {
        const breadcrumbs = elements[0];

        const editor = document.querySelector("#workbench\\.parts\\.editor");
        if (!editor)
                return;

        // Create custom container.
        let container = document.createElement("div");
        container.id = "storterald-breadcrumbs-container";
        container.appendChild(breadcrumbs);
        editor.appendChild(container);

        let options: MutationObserverInit = {
                childList: true,
                attributes: false,
                subtree: false
        };

        // Observer to check for breadcrumbs deletion
        let subObserver = new MutationObserver(() => {
                // Avoid recursion
                subObserver.disconnect();

                // The original breadcrumbs is above the custom one
                let breadcrumbs = document.querySelector(".breadcrumbs-below-tabs");
                if (breadcrumbs)
                        // Replace the now empty breadcrumbs with the new ones
                        container.replaceChildren(breadcrumbs);

                // Should observe the breadcrumbs itself as the outer div is
                // left alive without children.
                subObserver.observe(container.firstChild!, options);
        });

        subObserver.observe(container.firstChild!, options);
}

function addGradientDiv(elements: HTMLElement[]): void {
        const titlebar = elements[0];

        const div = document.createElement("div");
        div.id = "storterald-window-appicon-gradient";
        titlebar.prepend(div);
}

function moveBottomButtons(elements: HTMLElement[]): void {
        const activitybar = elements[0];
        const titlebar = elements[1];

        const bottom = activitybar.querySelectorAll(".monaco-action-bar.vertical")[1]
                .querySelector(".actions-container") as HTMLElement;
        const container = titlebar.querySelector(".monaco-action-bar");
        if (!bottom || !container)
                return;

        // Prepare the right titlebar
        container.id = "storterald-titlebar-container";

        // Move the bottom sidebar buttons to the top right
        bottom.style.scale = "1.3";
        container.append(bottom);
}

updateDivs([".breadcrumbs-below-tabs"], moveBreadcrumbs, false);
updateDivs([".titlebar-left"], addGradientDiv, false);
updateDivs(["#workbench\\.parts\\.activitybar", ".titlebar-right"], moveBottomButtons);