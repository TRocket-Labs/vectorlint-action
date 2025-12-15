import * as core from '@actions/core';
import { getChangedFiles } from './git-utils';
import { installVectorLint, installReviewdog } from './installers';
import { runVectorLint } from './runner';

async function run(): Promise<void> {
    try {
        // 1. Parse Inputs
        const githubToken = core.getInput('github_token') || process.env.GITHUB_TOKEN;
        const vectorlintVersion = core.getInput('vectorlint_version') || 'latest';

        // API Keys & Config
        const llmProvider = core.getInput('llm_provider');
        // Map inputs to env vars for VectorLint to pick up
        process.env['LLM_PROVIDER'] = llmProvider;
        process.env['OPENAI_API_KEY'] = core.getInput('openai_api_key');
        process.env['ANTHROPIC_API_KEY'] = core.getInput('anthropic_api_key');
        process.env['GEMINI_API_KEY'] = core.getInput('gemini_api_key');
        process.env['PERPLEXITY_API_KEY'] = core.getInput('perplexity_api_key');

        // Model Configs
        process.env['OPENAI_MODEL'] = core.getInput('openai_model');
        process.env['ANTHROPIC_MODEL'] = core.getInput('anthropic_model');
        process.env['GEMINI_MODEL'] = core.getInput('gemini_model');
        process.env['AZURE_OPENAI_MODEL'] = core.getInput('azure_openai_model');

        process.env['OPENAI_TEMPERATURE'] = core.getInput('openai_temperature');
        process.env['ANTHROPIC_TEMPERATURE'] = core.getInput('anthropic_temperature');
        process.env['ANTHROPIC_MAX_TOKENS'] = core.getInput('anthropic_max_tokens');
        process.env['GEMINI_TEMPERATURE'] = core.getInput('gemini_temperature');

        // Azure Config
        process.env['AZURE_OPENAI_API_KEY'] = core.getInput('azure_openai_api_key');
        process.env['AZURE_OPENAI_ENDPOINT'] = core.getInput('azure_openai_endpoint');
        process.env['AZURE_OPENAI_DEPLOYMENT_NAME'] = core.getInput('azure_openai_deployment_name');
        process.env['AZURE_OPENAI_API_VERSION'] = core.getInput('azure_openai_api_version');
        process.env['AZURE_OPENAI_TEMPERATURE'] = core.getInput('azure_openai_temperature');

        // Reviewdog Config env
        if (githubToken) {
            process.env['REVIEWDOG_GITHUB_API_TOKEN'] = githubToken;
        }

        // 2. Install Tools
        await installVectorLint(vectorlintVersion);
        await installReviewdog();

        // 3. Determine Files
        let targetFiles = ['.'];

        // Check if running in a PR (GITHUB_BASE_REF is set)
        const baseRef = process.env.GITHUB_BASE_REF;

        if (baseRef) {
            core.info(`Detected PR base ref: ${baseRef}`);
            const changedFiles = await getChangedFiles(baseRef);
            if (changedFiles.length === 0) {
                core.info('No markdown files changed in this PR. Skipping.');
                return;
            }
            targetFiles = changedFiles;
        } else {
            core.info('No PR base ref found. Scanning all files.');
        }

        // 4. Run Execution
        const reporter = core.getInput('reporter');
        const filterMode = core.getInput('filter_mode');
        const failOnError = core.getInput('fail_on_error');
        const toolName = core.getInput('tool_name');
        const vectorlintFlags = core.getInput('vectorlint_flags');

        await runVectorLint({
            files: targetFiles,
            vectorlintFlags,
            toolName,
            reporter,
            filterMode,
            failOnError
        });

    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        } else {
            core.setFailed('An unexpected error occurred.');
        }
    }
}

run();
