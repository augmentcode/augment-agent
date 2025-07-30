# Template System Documentation

The Auggie Agent supports a powerful template system that allows you to create reusable, dynamic instruction templates using the Nunjucks templating engine. Templates enable you to automatically extract and inject contextual data from GitHub pull requests and custom sources into your AI instructions.

## Why Use Templates?

Templates are ideal when you need:

- **Dynamic content**: Instructions that change based on PR data, file changes, or custom context
- **Reusable workflows**: Standardized instruction patterns across multiple repositories
- **Rich context**: Automatic extraction of PR details, file lists, and diffs
- **Complex logic**: Conditional content, loops, and data formatting

## Basic Usage

```yaml
- name: Run Auggie Agent with Template
  uses: augmentcode/augment-agent@v0
  with:
    augment_session_auth: ${{ secrets.AUGMENT_SESSION_AUTH }}
    github_token: ${{ secrets.GITHUB_TOKEN }}
    template_directory: '.github/templates'
    template_name: 'pr-review.njk'
    pull_number: ${{ github.event.pull_request.number }}
    repo_name: ${{ github.repository }}
```

## Template Inputs

| Input                | Description                            | Required                   | Example                                   |
| -------------------- | -------------------------------------- | -------------------------- | ----------------------------------------- |
| `template_directory` | Path to directory containing templates | Yes                        | `.github/templates`                       |
| `template_name`      | Template file name                     | No (default: `prompt.njk`) | `code-review.njk`                         |
| `pull_number`        | PR number for context extraction       | No\*                       | `${{ github.event.pull_request.number }}` |
| `repo_name`          | Repository in `owner/repo` format      | No\*                       | `${{ github.repository }}`                |
| `custom_context`     | Additional JSON context data           | No                         | `'{"priority": "high"}'`                  |

\*Required together when using PR context extraction

## Available Context Data

### PR Context (`pr`)

When `pull_number` and `repo_name` are provided, the following PR data is automatically extracted:

```nunjucks
{# Basic PR information #}
{{ pr.number }}           {# PR number #}
{{ pr.title }}            {# PR title #}
{{ pr.body }}             {# PR description/body #}
{{ pr.author }}           {# PR author username #}
{{ pr.state }}            {# PR state (open, closed, etc.) #}

{# Branch information #}
{{ pr.head.ref }}         {# Source branch name #}
{{ pr.head.sha }}         {# Source commit SHA #}
{{ pr.head.repo.name }}   {# Source repository name #}
{{ pr.head.repo.owner }}  {# Source repository owner #}

{{ pr.base.ref }}         {# Target branch name #}
{{ pr.base.sha }}         {# Target commit SHA #}
{{ pr.base.repo.name }}   {# Target repository name #}
{{ pr.base.repo.owner }}  {# Target repository owner #}

{# File changes #}
{{ pr.changed_files }}    {# Newline-separated list of changed files #}
{{ pr.diff_file }}        {# Path to generated diff file #}
```

### File List (`pr.changed_files_list`)

Array of changed files with detailed information:

```nunjucks
{% for file in pr.changed_files_list %}
  File: {{ file.filename }}
  Status: {{ file.status }}        {# added, modified, removed, renamed #}
  Additions: {{ file.additions }}
  Deletions: {{ file.deletions }}
  Changes: {{ file.changes }}
{% endfor %}
```

### Custom Context (`custom`)

Any additional data provided via the `custom_context` input:

```nunjucks
{# If custom_context: '{"priority": "high", "team": "backend"}' #}
{{ custom.priority }}    {# "high" #}
{{ custom.team }}        {# "backend" #}
```

## Template Filters

### `maybe_read_file`

Safely reads file content from allowed directories:

```nunjucks
{# Read the diff file #}
{{ pr.diff_file | maybe_read_file }}

{# Read a custom file from template directory #}
{{ "instructions/common.txt" | maybe_read_file }}
```

### `format_files`

Formats file arrays for display:

```nunjucks
{{ pr.changed_files_list | format_files }}
{# Output: MODIFIED: src/file1.ts
           ADDED: src/file2.ts
           DELETED: old/file3.ts #}
```

## Example Templates

### Basic PR Review Template

```nunjucks
{# .github/templates/pr-review.njk #}
Please review pull request #{{ pr.number }}: "{{ pr.title }}"

**Author:** {{ pr.author }}
**Branch:** {{ pr.head.ref }} → {{ pr.base.ref }}

**Changed Files:**
{{ pr.changed_files_list | format_files }}

**Code Changes:**
{{ pr.diff_file | maybe_read_file }}

Please provide a thorough code review focusing on:
- Code quality and best practices
- Security considerations
- Performance implications
- Testing coverage

{% if custom.priority == "high" %}
⚠️ This is a high-priority PR requiring urgent review.
{% endif %}
```

### Conditional Logic Template

```nunjucks
{# .github/templates/smart-review.njk #}
Reviewing PR #{{ pr.number }}: {{ pr.title }}

{% if pr.changed_files_list | length > 10 %}
This is a large PR with {{ pr.changed_files_list | length }} files changed.
Please pay special attention to:
{% for file in pr.changed_files_list[:5] %}
- {{ file.filename }} ({{ file.changes }} changes)
{% endfor %}
{% else %}
This is a focused PR with the following changes:
{% for file in pr.changed_files_list %}
- {{ file.filename }}: {{ file.status }} ({{ file.changes }} changes)
{% endfor %}
{% endif %}

{% set has_tests = pr.changed_files | includes("test") or pr.changed_files | includes("spec") %}
{% if not has_tests %}
⚠️ No test files detected. Please verify test coverage.
{% endif %}

{{ pr.diff_file | maybe_read_file }}
```

## File Organization

Organize your templates in a dedicated directory:

```
.github/
  templates/
    prompt.njk              # Default template
    pr-review.njk          # Code review template
    security-check.njk     # Security-focused review
    instructions/
      common.txt           # Shared instruction snippets
```

## Security Notes

- Templates can only read files from the template directory and `/tmp`
- File paths are validated to prevent directory traversal
- Template size is limited to 128KB
- Diff content is truncated at 128KB for large PRs

## Troubleshooting

**Template not found**: Ensure the template file exists in the specified directory and the path is correct.

**Context missing**: Verify that `pull_number` and `repo_name` are provided when using PR context.

**Invalid JSON**: Check that `custom_context` contains valid JSON if provided.

**File read errors**: Ensure files referenced in templates exist and are within allowed directories.
