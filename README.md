# VectorLint GitHub Action

A GitHub Action wrapper for [VectorLint](https://www.npmjs.com/package/vectorlint) - A command-line tool that evaluates and scores content using LLMs. It uses [LLM-as-a-Judge](https://en.wikipedia.org/wiki/LLM-as-a-Judge) to catch content quality issues that typically require human judgement.


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

concurrency:
  group: vectorlint-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run VectorLint
        uses: TRocket-Labs/vectorlint-action@v1
        with:
          llm_provider: ${{ secrets.LLM_PROVIDER }}
          # OpenAI
          openai_api_key: ${{ secrets.OPENAI_API_KEY }}
          openai_model: ${{ secrets.OPENAI_MODEL }}
          openai_temperature: ${{ secrets.OPENAI_TEMPERATURE }}
          # Perplexity
          perplexity_api_key: ${{ secrets.PERPLEXITY_API_KEY }}
          # Reviewdog options
          reporter: github-pr-check
          filter_mode: added
          fail_on_error: false
       
```

---

## Configuration Options

### Core Settings

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `llm_provider` | LLM provider (`openai`, `anthropic`, `gemini`, `azure-openai`) | No | `anthropic` |
| `vectorlint_version` | VectorLint npm package version | No | `latest` |
| `vectorlint_flags` | Additional CLI flags for vectorlint | No | `''` |

### LLM Provider API Keys

| Input | Description |
|-------|-------------|
| `openai_api_key` | OpenAI API key |
| `anthropic_api_key` | Anthropic API key |
| `gemini_api_key` | Google Gemini API key |
| `azure_openai_api_key` | Azure OpenAI API key |
| `perplexity_api_key` | Perplexity API key (for technical accuracy verification) |

> **Note**: You must provide the API key matching your selected `llm_provider`.

### Model Configuration

| Input | Description | Example Values |
|-------|-------------|----------------|
| `openai_model` | OpenAI model to use | `gpt-4`, `gpt-4-turbo`, `gpt-4o` |
| `anthropic_model` | Anthropic model to use | `claude-sonnet-4-20250514`, `claude-3-sonnet-20240229` |
| `anthropic_max_tokens` | Max tokens for Anthropic responses | `4096` |
| `gemini_model` | Gemini model to use | `gemini-2.5-pro`, `gemini-3-pro` |
| `azure_openai_model` | Azure OpenAI deployment name | Your deployment name |

### Temperature Settings

Temperature controls the randomness of LLM responses. Lower values (e.g., `0.1`) produce more deterministic outputs, while higher values (e.g., `0.8`) produce more creative outputs.

| Input | Description | Range |
|-------|-------------|-------|
| `openai_temperature` | Temperature for OpenAI | `0.0` - `2.0` |
| `anthropic_temperature` | Temperature for Anthropic | `0.0` - `1.0` |
| `gemini_temperature` | Temperature for Gemini | `0.0` - `2.0` |
| `azure_openai_temperature` | Temperature for Azure OpenAI | `0.0` - `2.0` |

> **Recommendation**: Use `0.2` - `0.4` for consistent linting results.

### Azure OpenAI Configuration

| Input | Description |
|-------|-------------|
| `azure_openai_api_key` | Azure OpenAI API key |
| `azure_openai_endpoint` | Azure OpenAI endpoint URL |
| `azure_openai_deployment_name` | Azure OpenAI deployment name |
| `azure_openai_api_version` | API version (e.g., `2024-02-15-preview`) |

### Perplexity Integration

Perplexity is used for **technical accuracy verification**. When enabled, VectorLint can cross-reference claims and technical statements against real-world data.

| Input | Description |
|-------|-------------|
| `perplexity_api_key` | Perplexity API key for search-based fact verification |

### Reviewdog Settings

| Input | Description | Default |
|-------|-------------|---------|
| `reporter` | Reporter type | `github-pr-check` |
| `filter_mode` | Filter mode | `added` |
| `fail_on_error` | Fail workflow if errors found | `true` |
| `tool_name` | Name shown in GitHub Checks | `vectorlint` |
| `github_token` | GitHub token for reviewdog | `${{ github.token }}` |

#### Reporter Types

| Type | Description |
|------|-------------|
| `github-pr-check` | Annotations in Files Changed tab |
| `github-pr-review` | Comments directly on PR lines |
| `github-check` | Check status only (no inline annotations) |

#### Filter Modes

| Mode | Description |
|------|-------------|
| `added` | Only new/changed lines (recommended) |
| `diff_context` | Lines in diff context |
| `file` | Entire changed files |
| `nofilter` | All lines in changed files |

---

## Examples

### OpenAI with GPT-4

```yaml
- uses: TRocket-Labs/vectorlint-action@v1
  with:
    llm_provider: openai
    openai_api_key: ${{ secrets.OPENAI_API_KEY }}
    openai_model: gpt-4
    openai_temperature: '0.3'
```

### Anthropic with Claude

```yaml
- uses: TRocket-Labs/vectorlint-action@v1
  with:
    llm_provider: anthropic
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    anthropic_model: claude-3-sonnet-20240229
    anthropic_temperature: '0.2'
    anthropic_max_tokens: '4096'
```

### Google Gemini

```yaml
- uses: TRocket-Labs/vectorlint-action@v1
  with:
    llm_provider: gemini
    gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
    gemini_model: gemini-1.5-pro
    gemini_temperature: '0.3'
```

### Azure OpenAI

```yaml
- uses: TRocket-Labs/vectorlint-action@v1
  with:
    llm_provider: azure-openai
    azure_openai_api_key: ${{ secrets.AZURE_OPENAI_API_KEY }}
    azure_openai_endpoint: ${{ secrets.AZURE_OPENAI_ENDPOINT }}
    azure_openai_deployment_name: my-gpt4-deployment
    azure_openai_api_version: '2024-02-15-preview'
    azure_openai_temperature: '0.3'
```

### With Perplexity for Technical Accuracy

```yaml
- uses: TRocket-Labs/vectorlint-action@v1
  with:
    llm_provider: openai
    openai_api_key: ${{ secrets.OPENAI_API_KEY }}
    openai_model: gpt-4
    perplexity_api_key: ${{ secrets.PERPLEXITY_API_KEY }}
```

### Strict Mode (Fail on Errors)

```yaml
- uses: TRocket-Labs/vectorlint-action@v1
  with:
    llm_provider: anthropic
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    fail_on_error: true
    filter_mode: nofilter
```

### Advisory Mode (Comments Only)

```yaml
- uses: TRocket-Labs/vectorlint-action@v1
  with:
    llm_provider: gemini
    gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
    fail_on_error: false
    reporter: github-pr-review
```

---

## How It Works

1. Installs [VectorLint](https://www.npmjs.com/package/vectorlint) from npm
2. Detects changed Markdown files in the PR
3. Runs AI-powered linting using your configured LLM provider
4. (Optional) Verifies technical accuracy via Perplexity
5. Pipes results to [reviewdog](https://github.com/reviewdog/reviewdog) for PR annotations

## Requirements

- **LLM Provider**: At least one of `openai_api_key`, `anthropic_api_key`, `gemini_api_key`, or Azure OpenAI credentials
- **Permissions**: `contents: read`, `pull-requests: write`, `checks: write`

## License

MIT
