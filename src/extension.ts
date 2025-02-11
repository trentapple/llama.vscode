import * as vscode from 'vscode';
import {Application} from "./application";

export function activate(context: vscode.ExtensionContext) {
    let app = Application.getInstance();
    app.architect.setStatusBar(context)
    app.architect.setOnChangeConfiguration(context);
    app.architect.setCompletionProvider(context);
    app.architect.registerCommandManualCompletion(context);
    app.architect.registerCommandCopyChunks(context);
    app.architect.registerCommandNoCacheCompletion(context);
    app.architect.setOnSaveFile(context);
    app.architect.setPeriodicRingBufferUpdate(context);
    app.architect.setClipboardEvents(context);
    app.architect.setOnChangeActiveFile(context);
    app.architect.registerCommandAcceptFirstLine(context);
    app.architect.registerCommandAcceptFirstWord(context);
}

export function deactivate() {
    // Nothing to do. VS Code will dispose all registerd disposables
}
