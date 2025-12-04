# Comment Reaction Action - Integration Guide

## Summary

A new GitHub Action has been created in the `augment-agent` repository that can react to user comments with emoji reactions. This action is designed to be used in workflows that respond to PR review comments and issue comments.

## Repository Information

- **Repository**: `augmentcode/augment-agent`
- **Branch**: `feature/comment-reaction-action`
- **Action Path**: `comment-reaction/`
- **Commit**: `826fcce`

## What Was Created

### Files Created

1. **comment-reaction/action.yml** - Action metadata and composite action definition
2. **comment-reaction/src/index.ts** - TypeScript implementation
3. **comment-reaction/package.json** - Node.js dependencies
4. **comment-reaction/tsconfig.json** - TypeScript configuration
5. **comment-reaction/README.md** - Documentation and usage examples
6. **comment-reaction/package-lock.json** - Dependency lock file

### Key Features

- ✅ React to PR review comments
- ✅ React to issue comments  
- ✅ Support for all 8 GitHub reaction types (+1, -1, laugh, confused, heart, hooray, rocket, eyes)
- ✅ Configurable reaction type with sensible default (eyes)
- ✅ Full TypeScript implementation with type safety
- ✅ Comprehensive error handling and logging
- ✅ Output indicating success/failure

## How to Reference in assistant.yml

### Option 1: Reference the Branch Directly

```yaml
- name: React to original comment with eyes
  uses: augmentcode/augment-agent/comment-reaction@feature/comment-reaction-action
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    comment_id: ${{ github.event.comment.id }}
    event_name: ${{ github.event_name }}
```

### Option 2: With Custom Reaction

```yaml
- name: React to original comment with rocket
  uses: augmentcode/augment-agent/comment-reaction@feature/comment-reaction-action
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    comment_id: ${{ github.event.comment.id }}
    event_name: ${{ github.event_name }}
    reaction: rocket
```

### Complete Example for assistant.yml

Replace the existing `actions/github-script@v7` step (lines 31-53) with:

```yaml
- name: React to original comment with eyes
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
| `github_token` | GitHub token for API access | Yes | - |
| `comment_id` | The ID of the comment to react to | Yes | - |
| `event_name` | The GitHub event name | Yes | - |
| `reaction` | The reaction type to add | No | `eyes` |

## Outputs

| Output | Description |
|--------|-------------|
| `success` | Whether the reaction was successfully added (`true` or `false`) |

## Supported Reactions

- `+1` - 👍
- `-1` - 👎
- `laugh` - 😄
- `confused` - 😕
- `heart` - ❤️
- `hooray` - 🎉
- `rocket` - 🚀
- `eyes` - 👀

## Next Steps

1. **Test the Action**: You can now reference this action in the `bumpy/.github/workflows/assistant.yml` file
2. **Merge to Main**: Once tested, merge the `feature/comment-reaction-action` branch to `main`
3. **Create a Tag**: After merging, create a version tag (e.g., `v1.0.0`) for stable references
4. **Update References**: Update workflow files to use the tag instead of the branch name

## Example: Full Workflow Integration

```yaml
name: Augment Agent

on:
  pull_request_review_comment:
    types: [created]
  issue_comment:
    types: [created]

permissions:
  contents: read
  pull-requests: write
  issues: write
  id-token: write
  actions: read

jobs:
  auggie-review-comment:
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
      
      - name: React to original comment with eyes
        uses: augmentcode/augment-agent/comment-reaction@feature/comment-reaction-action
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          comment_id: ${{ github.event.comment.id }}
          event_name: ${{ github.event_name }}
          reaction: eyes
      
      # ... rest of your workflow steps
```

## Support

For issues or questions, please refer to the README.md in the comment-reaction directory or create an issue in the augment-agent repository.

