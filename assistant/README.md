# PR Assistant Action

An AI-powered GitHub Action that implements code changes based on PR comments using the Auggie SDK.

## Features

- 🤖 **AI-Powered Implementation**: Uses Auggie SDK to understand and implement requested changes
- 📋 **Context-Aware**: Gathers full PR context including diff, files, and comment threads
- 🔄 **Automatic Commits**: Commits and pushes changes directly to the PR branch
- 💬 **Status Updates**: Posts success/failure comments to the PR
- 👀 **Visual Feedback**: Adds emoji reactions to show processing status
- ✅ **Full TypeScript**: Type-safe implementation with comprehensive error handling

## Usage

### Basic Example

```yaml
- name: PR Assistant
  uses: augmentcode/augment-agent/assistant@feature/comment-reaction-action
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    comment_id: ${{ github.event.comment.id }}
    event_name: ${{ github.event_name }}
    augment_api_token: ${{ secrets.AUGMENT_API_KEY }}
    augment_api_url: ${{ secrets.AUGMENT_API_URL }}
```

### With Custom Reaction

```yaml
- name: PR Assistant
  uses: augmentcode/augment-agent/assistant@feature/comment-reaction-action
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    comment_id: ${{ github.event.comment.id }}
    event_name: ${{ github.event_name }}
    reaction: rocket
    augment_api_token: ${{ secrets.AUGMENT_API_KEY }}
    augment_api_url: ${{ secrets.AUGMENT_API_URL }}
```

### Complete Workflow Example

```yaml
name: PR Assistant
on:
  pull_request_review_comment:
    types: [created]
  issue_comment:
    types: [created]

permissions:
  contents: read
  pull-requests: write
  issues: write

jobs:
  assistant:
    if: |
      contains(github.event.comment.body, '@augment') ||
      contains(github.event.comment.body, '@Augment')
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          repository: ${{ github.repository }}
          token: ${{ secrets.GITHUB_TOKEN }}
          ref: ${{ github.event.pull_request.head.ref }}

      - name: Run PR Assistant
        uses: augmentcode/augment-agent/assistant@feature/comment-reaction-action
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          comment_id: ${{ github.event.comment.id }}
          event_name: ${{ github.event_name }}
          reaction: eyes
          augment_api_token: ${{ secrets.AUGMENT_API_KEY }}
          augment_api_url: ${{ secrets.AUGMENT_API_URL }}
```

## How It Works

1. **Trigger**: Workflow is triggered by a comment containing `@augment` or `@Augment`
2. **React**: Adds an emoji reaction (default: 👀) to show processing has started
3. **Gather Context**: Collects PR metadata, diff, files changed, and comment thread
4. **Invoke Auggie**: Sends the context and instruction to Auggie SDK
5. **Implement**: Auggie analyzes the request and implements the changes
6. **Commit**: Automatically commits changes with a descriptive message
7. **Push**: Pushes the commit to the PR's head branch
8. **Notify**: Posts a success or failure comment to the PR

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `github_token` | GitHub token for API access and git operations | Yes | - |
| `comment_id` | The ID of the comment that triggered the workflow | Yes | - |
| `event_name` | The GitHub event name (`pull_request_review_comment` or `issue_comment`) | Yes | - |
| `augment_api_token` | Augment API token for authentication | Yes | - |
| `augment_api_url` | Augment API URL endpoint | Yes | - |
| `reaction` | The reaction type to add (optional) | No | `eyes` |

## Supported Reactions

- `+1` - 👍
- `-1` - 👎
- `laugh` - 😄
- `confused` - 😕
- `heart` - ❤️
- `hooray` - 🎉
- `rocket` - 🚀
- `eyes` - 👀

## Outputs

| Output | Description |
|--------|-------------|
| `success` | Whether the reaction was successfully added (`true` or `false`) |

## Permissions

The action requires the following permissions:

```yaml
permissions:
  contents: read        # To read repository content
  pull-requests: write  # To add reactions and comments to PRs
  issues: write         # To add reactions and comments to issues
```

## Setup

### 1. Configure Secrets

Add the following secrets to your repository:

- `AUGMENT_API_KEY`: Your Augment API token
- `AUGMENT_API_URL`: Your Augment API URL endpoint

### 2. Create Workflow

Create `.github/workflows/assistant.yml` with the example workflow above.

### 3. Test

Create a test PR and comment with `@augment <your instruction>`. For example:

```
@augment Add error handling to the login function
```

The assistant will:
- React with 👀 to acknowledge
- Gather PR context
- Implement the requested changes
- Commit and push to the PR branch
- Comment with the result

## Example Instructions

- `@augment Add unit tests for the UserService class`
- `@augment Refactor this function to use async/await`
- `@augment Fix the TypeScript errors in this file`
- `@augment Add JSDoc comments to all exported functions`
- `@augment Implement the TODO comments in this PR`

## Troubleshooting

### No changes committed

- Check that Auggie has write access to the repository
- Verify that the PR branch is not protected
- Check the workflow logs for errors

### Auggie fails to connect

- Verify `AUGMENT_API_KEY` and `AUGMENT_API_URL` are set correctly
- Check that the API endpoint is accessible from GitHub Actions

### Changes not appearing

- Ensure the workflow has `contents: write` permission
- Check that the checkout step uses the correct branch reference

## License

MIT

