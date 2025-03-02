function observeDiv(
        identifier: string,
        callback: CallableFunction,
        observe: boolean = true,
        options: MutationObserverInit = { childList: true, attributes: false, subtree: false }
): MutationObserver | null {

        function createObserver(element: HTMLElement): MutationObserver | null {
                if (!element) {
                        console.error("Cannot create observer with null element.");
                        return null;
                }

                const observer = new MutationObserver(() => {
                        console.info(`Mutation detected for element [${identifier}]`);

                        // Avoid recursion
                        observer.disconnect();
                        
                        callback(element);

                        observer.observe(element.parentElement!, options);
                });

                // Observe the parent
                observer.observe(element.parentElement!, options);
                return observer;
        }

        function waitForDiv(): Promise<HTMLElement> {
                return new Promise((resolve, reject) => {
                        const timeout = 5000; // ms
                        const interval = 100; // ms

                        const startTime = Date.now();
                        const checkExist = () => {
                                const element = document.querySelector(identifier);
                                if (element)
                                        resolve(element as HTMLElement);
                                else if (Date.now() - startTime > timeout)
                                        reject(`Timeout: Element [${identifier}] not found within ${timeout}ms`);
                                else
                                        setTimeout(checkExist, interval);
                        };

                        checkExist();
                });
        }

        let observer: MutationObserver | null = null;
        waitForDiv().then((element: HTMLElement) => {
                callback(element);

                if (observe)
                        observer = createObserver(element);
        }).catch((error: Error) => {
                console.error(error);
        });

        return observer;
}

function moveBreadcrumbs(element: HTMLElement): void {
        const editor = document.querySelector("#workbench\\.parts\\.editor");
        if (!editor)
                return;

        // Create custom container.
        let container = document.createElement("div");
        container.id = "storterald-breadcrumbs-container";
        container.appendChild(element);
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

function moveBottomButtons(element: HTMLElement): void {
        let top = element.querySelectorAll(".monaco-action-bar.vertical")[0]
                .querySelector(".actions-container");
        let bottom = element.querySelectorAll(".monaco-action-bar.vertical")[1]
                .querySelector(".actions-container");
        let container = document.querySelector(".titlebar-right")
                ?.querySelector(".monaco-action-bar");

        if (!bottom || !container || !top)
                return;

        // This moves the node from the original place
        container.append(bottom);

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

function addGradientDiv(element: HTMLElement): void {
        const div = document.createElement("div");
        div.id = "storterald-window-appicon-gradient";
        element.prepend(div);
}

observeDiv(".breadcrumbs-below-tabs", moveBreadcrumbs, false);
observeDiv("#workbench\\.parts\\.activitybar", moveBottomButtons);
observeDiv(".titlebar-left", addGradientDiv, false);