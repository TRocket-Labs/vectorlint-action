import * as exec from '@actions/exec';
import * as core from '@actions/core';

export interface RunnerOptions {
    files: string[];
    vectorlintFlags: string;
    toolName: string;
    reporter: string;
    filterMode: string;
    failOnError: string;
}

export async function runVectorLint(options: RunnerOptions): Promise<void> {
    const { files, vectorlintFlags, toolName, reporter, filterMode, failOnError } = options;

    if (files.length === 0) {
        core.info('No files to scan.');
        return;
    }

    const vectorLintArgs = ['--output', 'rdjson'];
    if (vectorlintFlags) {
        vectorLintArgs.push(...vectorlintFlags.split(' '));
    }
    vectorLintArgs.push(...files);


    const reviewdogArgs = [
        `-f=rdjson`,
        `-name=${toolName}`,
        `-reporter=${reporter}`,
        `-filter-mode=${filterMode}`,
        `-fail-on-error=${failOnError}`
    ];

    core.info(`Running VectorLint: vectorlint ${vectorLintArgs.join(' ')}`);
    core.info(`Running Reviewdog: reviewdog ${reviewdogArgs.join(' ')}`);

    let rdJsonOutput = '';
    let vectorLintError = '';

    const vectorLintOptions: exec.ExecOptions = {
        listeners: {
            stdout: (data: Buffer) => {
                rdJsonOutput += data.toString();
            },
            stderr: (data: Buffer) => {
                vectorLintError += data.toString();
                process.stderr.write(data);
            }
        },
        ignoreReturnCode: true
    };

    const code = await exec.exec('vectorlint', vectorLintArgs, vectorLintOptions);

    if (code !== 0 && !rdJsonOutput) {
        throw new Error(`VectorLint failed with exit code ${code}: ${vectorLintError}`);
    }

    const reviewdogOptions: exec.ExecOptions = {
        input: Buffer.from(rdJsonOutput, 'utf-8'),
        ignoreReturnCode: failOnError === 'false'
    };

    await exec.exec('reviewdog', reviewdogArgs, reviewdogOptions);
}
