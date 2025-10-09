# Auggie Agent GitHub Action

AI-powered code assistance for GitHub pull requests using Auggie.

## Quick Start

### 1. Get Your Augment API Credentials

First, you'll need to obtain your Augment Authentication information from your local Auggie session:

Example session JSON:

```json
{
  "accessToken": "your-api-token-here",
  "tenantURL": "https://your-tenant.api.augmentcode.com"
}
```

There are 2 ways to get the credentials:

- Run `auggie tokens print`
  - Copy the JSON after `TOKEN=`
- Copy the credentials stored in your Augment cache directory, defaulting to `~/.augment/session.json`

> **⚠️ Security Warning**: These tokens are OAuth tokens tied to your personal Augment account and provide access to your Augment services. They are not tied to a team or enterprise. Treat them as sensitive credentials:
>
> - Never commit them to version control
> - Only store them in secure locations (like GitHub secrets)
> - Don't share them in plain text or expose them in logs
> - If a token is compromised, immediately revoke it using `auggie tokens revoke`

### 2. Set Up the GitHub Repository Secret

You need to add your Augment credentials to your GitHub repository:

#### Adding Secret

1. **Navigate to your repository** on GitHub
2. **Go to Settings** → **Secrets and variables** → **Actions**
3. **Add the following**:
   - **Secret**: Click "New repository secret"
     - Name: `AUGMENT_SESSION_AUTH`
     - Value: The json value from step 1

> **Need more help?** For detailed instructions on managing GitHub secrets, see GitHub's official documentation:
>
> - [Using secrets in GitHub Actions](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)

### 3. Create Your Workflow File

Add a new workflow file to your repository's `.github/workflows/` directory and merge it.

#### Example Workflows

For complete workflow examples, see the [`example-workflows/`](./example-workflows/) directory which contains:

- **PR Description Generation** - Automatically generate comprehensive PR descriptions
- **Code Review** - Perform automated code quality and security reviews
- **Issue Triage** - Automatically analyze and triage GitHub issues with priority and categorization recommendations
- **Template-Based Review** - Demonstrates the template system for dynamic, context-aware instructions

Each example includes a complete workflow file that you can copy to your `.github/workflows/` directory and customize for your needs.

## Advanced

### Performance Optimization

For large repositories with extensive history, you can significantly speed up the checkout process by using a shallow clone:

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 1 # Shallow clone for faster checkout
```

The `fetch-depth` parameter controls how much history is fetched:

- `fetch-depth: 1` - Only the latest commit (fastest for most use cases)
- `fetch-depth: 50` - Last 50 commits (balance between speed and history)
- `fetch-depth: 0` - Full history (slowest but complete, default behavior)

For most PR reviews and code analysis, a shallow clone (`fetch-depth: 1`) provides sufficient context while significantly reducing checkout time.

### Inputs

| Input                  | Description                                                                                                                       | Required | Example                                           |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------- |
| `augment_session_auth` | Augment session authentication JSON (store as secret)                                                                             | No\*\*   | `${{ secrets.AUGMENT_SESSION_AUTH }}`             |
| `augment_api_token`    | API token for Augment services (store as secret)                                                                                  | No\*\*   | `${{ secrets.AUGMENT_API_TOKEN }}`                |
| `augment_api_url`      | Augment API endpoint URL (store as variable)                                                                                      | No\*\*   | `${{ vars.AUGMENT_API_URL }}`                     |
| `github_token`         | GitHub token with `repo` and `user:email` scopes.                                                                                 | No       | `${{ secrets.GITHUB_TOKEN }}`                     |
| `instruction`          | Direct instruction text for simple commands                                                                                       | No\*     | `"Generate PR description"`                       |
| `instruction_file`     | Path to file with detailed instructions                                                                                           | No\*     | `/tmp/instruction.txt`                            |
| `template_directory`   | Path to template directory for dynamic instructions                                                                               | No\*     | `.github/templates`                               |
| `template_name`        | Template file name (default: prompt.njk)                                                                                          | No       | `pr-review.njk`                                   |
| `pull_number`          | PR number for template context extraction                                                                                         | No       | `${{ github.event.pull_request.number }}`         |
| `repo_name`            | Repository name for template context                                                                                              | No       | `${{ github.repository }}`                        |
| `custom_context`       | Additional JSON context for templates                                                                                             | No       | `'{"priority": "high"}'`                          |
| `model`                | Model to use; passed through to auggie as --model                                                                                 | No       | e.g. `sonnet4`, from `auggie --list-models`       |
| `rules`                | JSON array of rules file paths (each forwarded as individual `--rules` flags)                                                     | No       | `'[".github/augment/rules.md"]'`                  |
| `mcp_configs`          | JSON array of MCP config file paths (each forwarded as individual `--mcp-config` flags)                                           | No       | `'[".augment/mcp/config.json"]'`                  |
| `fetch_depth`          | Number of commits to fetch. Use `0` for full history (default), `1` for shallow clone, or any positive integer for specific depth | No       | `1` (shallow), `50` (last 50 commits), `0` (full) |

\*Either `instruction`, `instruction_file`, or `template_directory` must be provided.

\*\*Either `augment_session_auth` OR both `augment_api_token` and `augment_api_url` must be provided for authentication.

### Template System

For advanced use cases, the Auggie Agent supports a template system that automatically extracts context from GitHub pull requests and allows you to create dynamic, reusable instruction templates. Templates are ideal when you need instructions that adapt based on PR content, file changes, or custom data.

See [TEMPLATE.md](./TEMPLATE.md) for complete documentation on creating and using templates.
