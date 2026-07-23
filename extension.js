const vscode = require('vscode');
const { spawn } = require('child_process');
const path = require('path');

let activeProc = null;
let statusItem = null;

function buildArgs(cfg) {
    const args = [];
    const voicesDir = cfg.get('voicesDir');
    const model   = cfg.get('model');
    const length  = cfg.get('lengthScale');
    const noise   = cfg.get('noiseScale');
    const noiseW  = cfg.get('noiseW');
    const silence = cfg.get('sentenceSilence');
    const volume  = cfg.get('volume');
    const tempo   = cfg.get('tempo');
    const gain    = cfg.get('soxGain');
    const speaker = cfg.get('speaker');

    if (voicesDir)        args.push('--voices-dir',       voicesDir);
    if (model)            args.push('--model',            model);
    if (length  != null)  args.push('--length-scale',     String(length));
    if (noise   != null)  args.push('--noise-scale',      String(noise));
    if (noiseW  != null)  args.push('--noise-w',          String(noiseW));
    if (silence != null)  args.push('--sentence-silence', String(silence));
    if (volume  != null)  args.push('--volume',           String(volume));
    if (tempo   != null)  args.push('--tempo',            String(tempo));
    if (gain    != null)  args.push('--sox-gain',         String(gain));
    if (speaker)          args.push('--speaker',          speaker);

    return args;
}

function validateConfig(cfg) {
    const voicesDir = cfg.get('voicesDir');
    if (!voicesDir) {
        vscode.window.showErrorMessage(
            'Piper Reader: set piperReader.voicesDir to your voice models directory first.',
            'Open Settings'
        ).then(action => {
            if (action === 'Open Settings')
                vscode.commands.executeCommand('workbench.action.openSettings', 'piperReader.voicesDir');
        });
        return false;
    }
    return true;
}

function activate(context) {
    statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    statusItem.command = 'piper-reader.stop';
    context.subscriptions.push(statusItem);

    const readCmd = vscode.commands.registerCommand('piper-reader.readFile', (uri) => {
        const filePath = uri ? uri.fsPath : vscode.window.activeTextEditor?.document.uri.fsPath;
        if (!filePath) {
            vscode.window.showErrorMessage('Piper Reader: no file to read.');
            return;
        }

        stopReading();

        const cfg = vscode.workspace.getConfiguration('piperReader');
        if (!validateConfig(cfg)) return;
        const scriptPath = path.join(__dirname, 'piper-reader');
        const args = [...buildArgs(cfg), filePath];

        activeProc = spawn(scriptPath, args, { stdio: 'ignore', detached: true });

        statusItem.text = `$(unmute) ${path.basename(filePath)}  $(primitive-square)`;
        statusItem.tooltip = 'Click to stop Piper Reader';
        statusItem.show();

        activeProc.on('exit', () => {
            activeProc = null;
            statusItem.hide();
        });
    });

    const stopCmd = vscode.commands.registerCommand('piper-reader.stop', () => {
        stopReading();
    });

    const saveCmd = vscode.commands.registerCommand('piper-reader.saveFile', async (uri) => {
        const filePath = uri ? uri.fsPath : vscode.window.activeTextEditor?.document.uri.fsPath;
        if (!filePath) {
            vscode.window.showErrorMessage('Piper Reader: no file to save.');
            return;
        }

        const defaultUri = vscode.Uri.file(
            path.join(path.dirname(filePath), path.basename(filePath, path.extname(filePath)) + '.wav')
        );

        const saveUri = await vscode.window.showSaveDialog({
            defaultUri,
            filters: { 'WAV Audio': ['wav'] },
            title: 'Save Piper audio as...'
        });

        if (!saveUri) return;

        const cfg = vscode.workspace.getConfiguration('piperReader');
        if (!validateConfig(cfg)) return;
        const scriptPath = path.join(__dirname, 'piper-reader');
        const args = [...buildArgs(cfg), '--output', saveUri.fsPath, filePath];

        const proc = spawn(scriptPath, args, { stdio: 'ignore', detached: true });
        proc.unref();

        vscode.window.setStatusBarMessage(`Piper: saving ${path.basename(saveUri.fsPath)}...`, 8000);

        proc.on('exit', (code) => {
            if (code === 0) {
                vscode.window.showInformationMessage(`Piper: saved to ${saveUri.fsPath}`);
            } else {
                vscode.window.showErrorMessage(`Piper: save failed (exit ${code})`);
            }
        });
    });

    context.subscriptions.push(readCmd, stopCmd, saveCmd);
}

function stopReading() {
    if (activeProc) {
        try { process.kill(-activeProc.pid, 'SIGTERM'); } catch (_) {}
        activeProc = null;
        statusItem.hide();
    }
    spawn('pkill', ['-f', 'piper-reader'], { stdio: 'ignore' });
    spawn('pkill', ['-x', 'play'],         { stdio: 'ignore' });
}

function deactivate() {
    stopReading();
}

module.exports = { activate, deactivate };
