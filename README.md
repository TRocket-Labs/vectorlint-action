# VectorLint GitHub Action

A GitHub Action wrapper for [VectorLint](https://github.com/TRocket-Labs/vectorlint) - AI-powered content linting for Markdown files.

## Features

- 🤖 AI-powered content analysis using LLMs
- 📝 Inline code annotations on PRs via reviewdog
- ✅ GitHub Checks integration
- 🎯 Configurable severity levels
- 🔍 Multiple LLM providers (OpenAI, Anthropic, Gemini)

## Usage

### Basic Setup

```yaml
name: VectorLint

on:
  pull_request:
    paths:
      - '**/*.md'
      - '**/*.mdx'

permissions:
  contents: read
  pull-requests: write
  checks: write

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run VectorLint
        uses: TRocket-Labs/vectorlint-action@v1
        with:
          gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
```

### Configuration Options

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `gemini_api_key` | Google Gemini API key | One of the API keys | - |
| `openai_api_key` | OpenAI API key | One of the API keys | - |
| `anthropic_api_key` | Anthropic API key | One of the API keys | - |
| `reporter` | Reporter type | No | `github-pr-check` |
| `filter_mode` | Filter mode | No | `added` |
| `fail_on_error` | Fail if errors found | No | `true` |
| `vectorlint_flags` | Additional flags | No | `''` |
| `vectorlint_version` | VectorLint version (branch/tag) | No | `main` |

### Reporter Types

- `github-pr-check`: Annotations in Files Changed tab
- `github-pr-review`: Comments on PR
- `github-check`: Check status only

### Filter Modes

- `added`: Only new/changed lines (recommended)
- `nofilter`: All lines in changed files
- `diff_context`: Lines in diff context
- `file`: Entire changed files

## Examples

### Strict Mode

```yaml
- uses: TRocket-Labs/vectorlint-action@v1
  with:
    gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
    fail_on_error: true
    filter_mode: nofilter
```

### Advisory Mode

```yaml
- uses: TRocket-Labs/vectorlint-action@v1
  with:
    gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
    fail_on_error: false
    reporter: github-pr-review
```

### Pin to Specific Version

```yaml
- uses: TRocket-Labs/vectorlint-action@v1
  with:
    gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
    vectorlint_version: 'v1.0.0'  # Pin to specific vectorlint version
```

## How It Works

This action:
1. Installs [VectorLint](https://github.com/TRocket-Labs/vectorlint) from GitHub
2. Runs it on changed Markdown files
3. Pipes results to [reviewdog](https://github.com/reviewdog/reviewdog) for PR annotations

## Requirements

- One of: `GEMINI_API_KEY`, `OPENAI_API_KEY`, or `ANTHROPIC_API_KEY`
- Workflow permissions for `contents: read`, `pull-requests: write`, `checks: write`

## License

MIT
