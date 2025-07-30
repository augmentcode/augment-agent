# Example Workflows

This directory contains example GitHub Actions workflows demonstrating different use cases for the Augment Agent.

**Important**: These workflows pass essential PR context information to the Augment Agent through instruction files that include the PR number, repository, base branch, and head branch. This provides the agent with the necessary context to identify and analyze the specific pull request changes.

## Available Examples

### [pr-description.yml](./pr-description.yml)

Automatically generates comprehensive PR descriptions when a PR is first opened. Creates a dynamic instruction file with essential PR context (number, repository, base/head branches).

### [code-review.yml](./code-review.yml)

Performs automated code review when a PR is first opened. Creates an instruction file that includes:

- Essential PR identification information
- Focus areas for code quality and best practices
- Security vulnerability detection
- Performance and maintainability analysis

### [triage-issue.yml](./triage-issue.yml)

Automatically triages GitHub issues when they are opened, edited, or labeled. Provides comprehensive analysis including:

- Priority and complexity assessment
- Issue categorization and suggested labels
- Team/component identification
- Reproducibility and requirements evaluation
- Actionable recommendations for maintainers

### [template-pr-review.yml](./template-pr-review.yml)

Demonstrates the **template system** for dynamic instruction generation. This example shows how to:

- Use Nunjucks templates for flexible instruction creation
- Automatically extract PR context (files, diffs, metadata)
- Include custom context data via JSON
- Apply conditional logic based on PR characteristics
- Format file lists and read diff content within templates

This template-based approach is ideal for complex, reusable workflows that need to adapt based on PR content.

## Customization

You can modify these examples by:

- **Simple workflows**: Modifying the instruction file content to focus on different aspects
- **Template workflows**: Creating custom Nunjucks templates for dynamic, reusable instructions (see [template-pr-review.yml](./template-pr-review.yml))
- Changing the trigger events (e.g., add `synchronize` to run on updates, or filter by specific branches)
- Adding additional PR context information (labels, reviewers, etc.)
- Including file diff information or specific file paths
- Combining multiple steps in a single workflow
- Adding conditional logic based on file changes or PR labels
- Customizing the instruction file location and naming

**Note**: These examples only run when a PR is first opened (`types: [opened]`) to avoid redundant analysis on every update. Add `synchronize` to the types array if you want the workflow to run on every push to the PR.

For template system documentation, see [TEMPLATE.md](../TEMPLATE.md).
For more advanced usage patterns, see the main [README.md](../README.md) documentation.
