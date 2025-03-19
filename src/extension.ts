import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export async function activate(context: vscode.ExtensionContext) {
        // Get all custom css files
        const cssDirectory: string = path.join(context.extensionPath, 'css')
        const cssFiles: string[] = fs.readdirSync(cssDirectory)
                .map(file => `file://${path.resolve(cssDirectory, file)}`);

        // Add global modifiers
        cssFiles.push(`file://${path.join(context.extensionPath, "js", "listeners.js")}`);

        // Update custom css imports
        const config = vscode.workspace.getConfiguration("vscode_custom_css");
        config.update('imports', cssFiles, vscode.ConfigurationTarget.Global);

        // Listen for settings changes and update for current one.
        vscode.workspace.onDidChangeConfiguration(event => updateSettings(context, event));
        updateSettings(context);

        // Listen for theme changes and update for current one.
        vscode.window.onDidChangeActiveColorTheme(handleThemeChange);
        handleThemeChange(vscode.window.activeColorTheme);

        const cmakeTools = vscode.extensions.getExtension('ms-vscode.cmake-tools');
        if (!cmakeTools) {
                vscode.window.showErrorMessage('CMake Tools extension is not installed.');
                return;
        }

        if (!cmakeTools.isActive) {
                await cmakeTools.activate();
        }

        // Register build commands.
        context.subscriptions.push(vscode.commands.registerCommand("jetbrains-ide-look.buildOptions", getBuildOptionCommand()));
        context.subscriptions.push(vscode.commands.registerCommand("jetbrains-ide-look.run", getRunCommand()));
        context.subscriptions.push(vscode.commands.registerCommand("jetbrains-ide-look.build", getBuildCommand()));
        context.subscriptions.push(vscode.commands.registerCommand("jetbrains-ide-look.debug", getDebugCommand()));
}

function getBuildOptionCommand(): (...args: any[]) => any {
        return async () => {
                vscode.commands.executeCommand("cmake.selectConfigurePreset");
        }
}

function getBuildCommand(): (...args: any[]) => any {
        return async () => {
                vscode.commands.executeCommand("cmake.build");
        }
}

function getRunCommand(): (...args: any[]) => any {
        return async () => {
                vscode.commands.executeCommand("cmake.launchTarget");
        }
}

function getDebugCommand(): (...args: any[]) => any {
        return async () => {
                vscode.commands.executeCommand("cmake.debugTarget");
        }
}

function updateSettings(context: vscode.ExtensionContext, event?: vscode.ConfigurationChangeEvent) {
        const config = vscode.workspace.getConfiguration("vscode_custom_css");

        const settingsMap: Map<string, string> = new Map()
                .set("textUnderButtons", "under_buttons.js")
                .set("showBuildButtons", "build_buttons.js");

        settingsMap.forEach((value: string, key: string) => {
                // If an update check if it's about a mapped setting.
                if (event && !event.affectsConfiguration(`jetbrains.ide.look.${key}`))
                        return;

                const isEnabled = vscode.workspace.getConfiguration("jetbrains.ide.look").get<boolean>("textUnderButtons");
                const script = `file://${path.join(context.extensionPath, "js", value)}`;

                // Get the current imports
                let imports = config.get<string[]>("imports", []);

                if (isEnabled || isEnabled === undefined) {
                        if (!imports.includes(script)) {
                                imports.push(script);
                                config.update("imports", imports, vscode.ConfigurationTarget.Global);
                        }
                } else {
                        if (imports.includes(script)) {
                                imports = imports.filter(path => path !== script);
                                config.update("imports", imports, vscode.ConfigurationTarget.Global);
                        }
                }
        });
}

function handleThemeChange(theme: vscode.ColorTheme) {
        const darkCommentTags =
                [
                        {
                                "tag": "TODO",
                                "color": "#8bb33d",
                                "strikethrough": false,
                                "underline": false,
                                "backgroundColor": "transparent",
                                "bold": false,
                                "italic": true
                        }
                ];

        const lightCommentTags =
                [
                        {
                                "tag": "TODO",
                                "color": "#008dde",
                                "strikethrough": false,
                                "underline": false,
                                "backgroundColor": "transparent",
                                "bold": false,
                                "italic": true
                        }
                ];

        const configuration = vscode.workspace.getConfiguration();
        switch (theme.kind) {
                case vscode.ColorThemeKind.Dark:
                        configuration.update('workbench.iconTheme', 'vscode-jetbrains-icon-theme-2023-dark', vscode.ConfigurationTarget.Global);
                        configuration.update('better-comments.tags', darkCommentTags, vscode.ConfigurationTarget.Global);
                        break;
                case vscode.ColorThemeKind.Light:
                        configuration.update('workbench.iconTheme', 'vscode-jetbrains-icon-theme-2023-light', vscode.ConfigurationTarget.Global);
                        configuration.update('better-comments.tags', lightCommentTags, vscode.ConfigurationTarget.Global);
                        break;
        }
}
