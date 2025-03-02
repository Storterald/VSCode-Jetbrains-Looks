function updateDivs(
        identifiers: string[],
        callback: CallableFunction,
        observe: boolean = true,
        options: MutationObserverInit | MutationObserverInit[] = { childList: true, attributes: false, subtree: false }
): (MutationObserver | null)[] | null {

        let observers: (MutationObserver | null)[] = [];
        let cache: HTMLElement[] = [];

        function createObserver(element: HTMLElement, options: MutationObserverInit): MutationObserver | null {
                if (!element) {
                        console.error("Cannot create observer with null element.");
                        return null;
                }

                const observer = new MutationObserver((): void => {
                        // Avoid recursion
                        observer.disconnect();
                        
                        callback(cache);

                        observer.observe(element.parentElement!, options);
                });

                // Observe the parent
                observer.observe(element.parentElement!, options);
                return observer;
        }

        function waitForDivs(): Promise<HTMLElement[]> {
                return new Promise((resolve, reject) => {
                        const timeout = 5000; // ms
                        const interval = 100; // ms
                        
                        let elements: (HTMLElement | null)[] = new Array(identifiers.length).fill(null);
                        let checksRemaining = identifiers.length;
                        const startTime = Date.now();

                        const checkExist = (index: number, identifier: string): void => {
                                const element = document.querySelector(identifier);
                                if (element && element !== undefined) {
                                        elements[index] = element as HTMLElement;
                                        
                                        if (--checksRemaining === 0)
                                                resolve(elements.filter((el) => el !== null) as HTMLElement[]);
                                } else if (Date.now() - startTime > timeout) {
                                        reject(`Timeout: Element(s) [${identifiers.join(', ')}] not found within ${timeout}ms`);
                                } else {
                                        setTimeout(() => checkExist(index, identifier), interval);
                                }
                        };

                        identifiers.forEach((identifier, index) => {
                                checkExist(index, identifier);        
                        })
                });
        }

        waitForDivs().then((elements: HTMLElement[]) => {
                cache = elements;
                callback(elements);

                if (observe)
                        elements.forEach((element, index): void => {
                                observers.push(createObserver(element, Array.isArray(options) ? options[index] : options));
                        })
        }).catch((error: Error) => {
                console.error(error);
        });

        return observers;
}

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

function fixButtons(elements: HTMLElement[]): void {
        const activitybar = elements[0];
        const titlebar = elements[1];

        const top = activitybar.querySelectorAll(".monaco-action-bar.vertical")[0]
                .querySelector(".actions-container") as HTMLElement;
        const bottom = activitybar.querySelectorAll(".monaco-action-bar.vertical")[1]
                .querySelector(".actions-container") as HTMLElement;
        const container = titlebar.querySelector(".monaco-action-bar");

        if (!bottom || !top || !container)
                return;

        // Move the bottom sidebar buttons to the top
        container.id = "storterald-titlebar-container";
        bottom.style.scale = "1.3";
        container.append(bottom);

        // Add text under sidebar buttons.
        const project = top.querySelector(".codicon-explorer-view-icon");
        if (project) {
                const p = document.createElement("p");
                p.appendChild(document.createTextNode("Project"));
                p.id = "storterald-btn-text";
                project.appendChild(p);
        }

        const commit = top.querySelector(".codicon-source-control-view-icon");
        if (commit) {
                const p = document.createElement("p");
                p.appendChild(document.createTextNode("Commit"));
                p.id = "storterald-btn-text";
                commit.appendChild(p);
        }

        const find = top.querySelector(".codicon-search-view-icon");
        if (find) {
                const p = document.createElement("p");
                p.appendChild(document.createTextNode("Find"));
                p.id = "storterald-btn-text";
                find.appendChild(p);
        }

        const plugins = top.querySelector(".codicon-extensions-view-icon");
        if (plugins) {
                const p = document.createElement("p");
                p.appendChild(document.createTextNode("Plugins"));
                p.id = "storterald-btn-text";
                plugins.appendChild(p);
        }
}

function addGradientDiv(elements: HTMLElement[]): void {
        const titlebar = elements[0];

        const div = document.createElement("div");
        div.id = "storterald-window-appicon-gradient";
        titlebar.prepend(div);
}

function moveButtons(elements: HTMLElement[]): void {
        const originalContainer = elements[0];
        const titlebar = elements[1];

        let container = titlebar.querySelector(".monaco-action-bar");
        const profilerContainer = titlebar.querySelector('ul[aria-label="Title actions"');

        if (!container || !profilerContainer)
                return;

        container.id = "storterald-titlebar-container";
        profilerContainer.id = "storterald-vscode-profiler-integration-buttons";

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

                // Check if the button is from the 'Build and Run' extension.
                let anchor = li.querySelector('a[aria-label^="Build and Run: "]')
                if (anchor) {
                        // If it's the run or the debug button, set the color
                        // to green.
                        const attr: string = anchor.getAttribute("aria-label")!;
                        if (attr === "Build and Run: Run Project"
                            || attr === "Build and Run: Debug Project") {
                                li.id = "storterald-build-and-run-exec-button";
                        }

                        list.append(li);
                        continue;
                }

                // Check if the button is from the 'VSCode Profiler Integration' extension.
                anchor = li.querySelector('a[aria-label^="VSCode Profiler Integration: "]');
                if (anchor)
                        profilerContainer.append(li);
        }
}

updateDivs([".breadcrumbs-below-tabs"], moveBreadcrumbs, false);
updateDivs(["#workbench\\.parts\\.activitybar", ".titlebar-right"], fixButtons);
updateDivs([".titlebar-left"], addGradientDiv, false);
// Observe the sub tree to check if a button is added after the div creation.
updateDivs([".tabs .editor-actions .actions-container", ".titlebar-right"], moveButtons, true,
        [{ childList: true, attributes: false, subtree: true }, { childList: true, attributes: false, subtree: false }]);