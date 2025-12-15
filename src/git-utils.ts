import * as exec from '@actions/exec';
import * as core from '@actions/core';

export async function getChangedFiles(baseRef: string): Promise<string[]> {
    let output = '';
    let errorOutput = '';

    const options: exec.ExecOptions = {
        listeners: {
            stdout: (data: Buffer) => {
                output += data.toString();
            },
            stderr: (data: Buffer) => {
                errorOutput += data.toString();
            }
        }
    };

    try {
        core.info(`Fetching origin/${baseRef}...`);
        await exec.exec('git', ['fetch', 'origin', baseRef, '--depth=1'], { ignoreReturnCode: true });

        core.info(`Diffing against origin/${baseRef}...`);
        // Check if the reference exists
        await exec.exec('git', ['diff', '--name-only', `origin/${baseRef}`, 'HEAD'], options);

        const files = output.trim().split('\n').filter(f => f.endsWith('.md'));
        return files;
    } catch (error) {
        core.warning(`Failed to get changed files: ${errorOutput || error}`);
        return [];
    }
}
