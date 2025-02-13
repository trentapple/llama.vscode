import {Application} from "./application";
import vscode from "vscode";

export class Menu {
    private app: Application
    constructor(application: Application) {
        this.app = application;
    }

    createMenuItems = (currentLanguage: string | undefined, isLanguageEnabled: boolean): vscode.QuickPickItem[] => {
        return [
            {
                label: `${this.app.extConfig.enabled ? 'Disable' : 'Enable'} All Completions`,
                description: `Turn ${this.app.extConfig.enabled ? 'off' : 'on'} completions globally`
            },
            currentLanguage ? {
                label: `${isLanguageEnabled ? 'Disable' : 'Enable'} Completions for ${currentLanguage}`,
                description: `Currently ${isLanguageEnabled ? 'enabled' : 'disabled'}`
            } : null,
            {
                label: "$(gear) Edit Settings...",
            },
            {
                label: "$(gear) Start llama.cpp server",
            },
            {
                label: "$(gear) Stop llama.cpp server",
            },
            {
                label: "$(book) View Documentation...",
            }
        ].filter(Boolean) as vscode.QuickPickItem[];
    }

    handleMenuSelection = async (selected: vscode.QuickPickItem, currentLanguage: string | undefined, languageSettings: Record<string, boolean>) => {
        switch (selected.label) {
            case "$(gear) Edit Settings...":
                await vscode.commands.executeCommand('workbench.action.openSettings', 'llama-vscode');
                break;
            case "$(gear) Start llama.cpp server":
                await this.app.llamaServer.launchCmd();
                break;
            case "$(gear) Stop llama.cpp server":
                await this.app.llamaServer.killCmd();
                break;
            case "$(book) View Documentation...":
                await vscode.env.openExternal(vscode.Uri.parse('https://github.com/ggml-org/llama.vscode'));
                break;
            default:
                await this.handleCompletionToggle(selected.label, currentLanguage, languageSettings);
                break;
        }
        this.app.statusbar.updateStatusBarText();
    }
    private async handleCompletionToggle(label: string, currentLanguage: string | undefined, languageSettings: Record<string, boolean>) {
        const config = this.app.extConfig.config;
        if (label.includes('All Completions')) {
            await config.update('enabled', !this.app.extConfig.enabled, true);
        } else if (currentLanguage && label.includes(currentLanguage)) {
            const isLanguageEnabled = languageSettings[currentLanguage] ?? true;
            languageSettings[currentLanguage] = !isLanguageEnabled;
            await config.update('languageSettings', languageSettings, true);
        }
    }


    showMenu = async () => {
        const currentLanguage = vscode.window.activeTextEditor?.document.languageId;
        const isLanguageEnabled = currentLanguage ? this.app.extConfig.isCompletionEnabled(undefined, currentLanguage) : true;

        const items = this.app.menu.createMenuItems(currentLanguage, isLanguageEnabled);
        const selected = await vscode.window.showQuickPick(items, { title: "Llama Menu" });

        if (selected) {
            await this.handleMenuSelection(selected, currentLanguage, this.app.extConfig.languageSettings);
        }
    }
}
