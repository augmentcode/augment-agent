# Comment Reaction Action

A GitHub Action that adds emoji reactions to comments on pull requests and issues.

## Features

- ✅ React to PR review comments
- ✅ React to issue comments
- ✅ Support for all GitHub reaction types
- ✅ TypeScript implementation with full type safety
- ✅ Detailed error messages and logging

## Usage

### Basic Example

```yaml
- name: React to comment with eyes
  uses: augmentcode/augment-agent/comment-reaction@feature/comment-reaction-action
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    comment_id: ${{ github.event.comment.id }}
    event_name: ${{ github.event_name }}
```

### Custom Reaction

```yaml
- name: React to comment with rocket
  uses: augmentcode/augment-agent/comment-reaction@feature/comment-reaction-action
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    comment_id: ${{ github.event.comment.id }}
    event_name: ${{ github.event_name }}
    reaction: rocket
```

### Complete Workflow Example

```yaml
name: React to Comments
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
  react:
    runs-on: ubuntu-latest
    steps:
      - name: React to comment
        uses: augmentcode/augment-agent/comment-reaction@feature/comment-reaction-action
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          comment_id: ${{ github.event.comment.id }}
          event_name: ${{ github.event_name }}
          reaction: eyes
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `github_token` | GitHub token for API access. Must have permissions to add reactions. | Yes | - |
| `comment_id` | The ID of the comment to react to | Yes | - |
| `event_name` | The GitHub event name (`pull_request_review_comment` or `issue_comment`) | Yes | - |
| `reaction` | The reaction type to add | No | `eyes` |

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
  pull-requests: write  # For PR review comments
  issues: write         # For issue comments
```

## License

MIT

