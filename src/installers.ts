import * as exec from '@actions/exec';
import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as io from '@actions/io';
import * as path from 'path';

export async function installVectorLint(version: string): Promise<void> {
    core.startGroup('Installing VectorLint');
    try {
        await exec.exec('npm', ['install', '-g', `vectorlint@${version}`]);
        core.info(`VectorLint ${version} installed successfully.`);
    } catch (error) {
        throw new Error(`Failed to install VectorLint: ${error}`);
    } finally {
        core.endGroup();
    }
}

export async function installReviewdog(version: string = 'latest'): Promise<string> {
    core.startGroup('Installing reviewdog');
    try {
        const installDir = path.join(process.cwd(), 'bin');
        await io.mkdirP(installDir);

        const installScriptUrl = 'https://raw.githubusercontent.com/reviewdog/reviewdog/master/install.sh';
        const scriptPath = await tc.downloadTool(installScriptUrl);

        // Make it executable on non-windows
        if (process.platform !== 'win32') {
            await exec.exec('chmod', ['+x', scriptPath]);
        }

        // Arguments for the installer script: -b <bin_dir> <version>
        const args = ['-b', installDir];
        if (version !== 'latest') {
            args.push(version);
        }

        core.info(`Running install script to ${installDir} with version ${version}...`);

        await exec.exec('sh', [scriptPath, ...args]);

        core.addPath(installDir);
        core.info('reviewdog installed and added to path');

        const executableName = process.platform === 'win32' ? 'reviewdog.exe' : 'reviewdog';
        return path.join(installDir, executableName);

    } catch (error) {
        throw new Error(`Failed to install reviewdog: ${error}`);
    } finally {
        core.endGroup();
    }
}
