import { updateDivs } from "./common.ts"

function addLabels(elements: HTMLElement[]) {
        var activitybar = elements[0];

        var top = activitybar.querySelectorAll(".monaco-action-bar.vertical")[0]
                .querySelector(".actions-container");
        if (!top)
                return;

        // Make the icons smaller.
        const style = document.createElement('style');
        style.textContent = `
                .monaco-action-bar.vertical .action-label.codicon::before {
                        scale: 75%;
                }
        `;
        activitybar.appendChild(style);

        const project = top.querySelector(".codicon-explorer-view-icon");
        if (project) {
                var p = document.createElement("p");
                p.appendChild(document.createTextNode("Project"));
                p.id = "storterald-btn-text";
                project.appendChild(p);
        }

        var commit = top.querySelector(".codicon-source-control-view-icon");
        if (commit) {
                var p = document.createElement("p");
                p.appendChild(document.createTextNode("Commit"));
                p.id = "storterald-btn-text";
                commit.appendChild(p);
        }

        var find = top.querySelector(".codicon-search-view-icon");
        if (find) {
                var p = document.createElement("p");
                p.appendChild(document.createTextNode("Find"));
                p.id = "storterald-btn-text";
                find.appendChild(p);
        }

        var plugins = top.querySelector(".codicon-extensions-view-icon");
        if (plugins) {
                var p = document.createElement("p");
                p.appendChild(document.createTextNode("Plugins"));
                p.id = "storterald-btn-text";
                plugins.appendChild(p);
        }
}

updateDivs(["#workbench\\.parts\\.activitybar"], addLabels);