import { updateDivs } from "./common.ts"

function moveBuildButtons(elements: HTMLElement[]): void {
        // Passing a random button anchor from the extension, a > li > ul
        const originalContainer = elements[0].parentElement!.parentElement!;
        const titlebar = elements[1];

        function inner(): void {
                let container = titlebar.querySelector(".monaco-action-bar");
                const profilerContainer = titlebar.querySelector('ul[aria-label="Title actions"');

                if (!container || !profilerContainer)
                        return;

                // Prepare the VSCode Profiler Integration container
                profilerContainer.id = "storterald-vscode-profiler-integration-buttons";

                // Create / Find the list for the build buttons.
                let list = container.querySelector("#storterald-build-and-run-buttons");
                if (!list) {
                        list = document.createElement("ul");
                        list.id = "storterald-build-and-run-buttons";
                        container.prepend(list);
                }

                // Move Build and Run buttons to the container
                const items = originalContainer.querySelectorAll(".action-item.menu-entry");
                for (let i = 0; i < items.length; ++i) {
                        const li = items[i];

                        // Move build buttons
                        let anchor = li.querySelector('a[aria-label^="Jetbrains IDE Look: "]')
                        if (anchor) {
                                // If it's the run or the debug button, set the color
                                // to green.
                                const attr: string = anchor.getAttribute("aria-label")!;
                                if (attr === "Jetbrains IDE Look: Run Project"
                                        || attr === "Jetbrains IDE Look: Debug Project")
                                        li.id = "storterald-build-and-run-exec-button";

                                list.append(li);
                                continue;
                        }

                        // Check if the button is from the 'VSCode Profiler Integration' extension.
                        anchor = li.querySelector('a[aria-label^="VSCode Profiler Integration: "]');
                        if (anchor)
                                profilerContainer.append(li);
                }
        }

        // Since the 'updateDivs' looks for a list entry, this starts observing
        // the list.
        const options: MutationObserverInit = {
                childList: true,
                attributes: false,
                subtree: false
        };

        const subObserver = new MutationObserver(() => {
                subObserver.disconnect();
                inner();
                subObserver.observe(originalContainer, options);
        });

        subObserver.observe(originalContainer, options);
        inner();
}

updateDivs(['.tabs .editor-actions .actions-container .action-item.menu-entry a[aria-label^="Jetbrains IDE Look: "]', ".titlebar-right"], moveBuildButtons, false, [true, false]);