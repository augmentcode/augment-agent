#!/usr/bin/env node

/**
 * PR Assistant GitHub Action
 * Reacts to comments and implements changes using Auggie SDK
 */

import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { Octokit } from '@octokit/rest';
import { Auggie } from '@augmentcode/auggie-sdk';



/**
 * PR Context gathered from GitHub
 */
interface PRContext {
  prNumber: number;
  title: string;
  description: string;
  headBranch: string;
  baseBranch: string;
  diff: string;
  filesChanged: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    patch?: string;
  }>;
  commentBody: string;
  commentThread: Array<{
    author: string;
    body: string;
    createdAt: string;
  }>;
}

/**
 * Get input from environment variables (GitHub Actions pattern)
 */
function getInput(name: string, required = false): string {
  const envName = `INPUT_${name.toUpperCase().replace(/ /g, '_')}`;
  const value = process.env[envName] || '';

  if (required && !value) {
    throw new Error(`Input required and not supplied: ${name}`);
  }

  return value.trim();
}

/**
 * Parse repository owner and name from GITHUB_REPOSITORY
 */
function parseRepository(): { owner: string; repo: string } {
  const repository = process.env.GITHUB_REPOSITORY || '';
  const [owner, repo] = repository.split('/');

  if (!owner || !repo) {
    throw new Error(
      `Invalid GITHUB_REPOSITORY format: ${repository}. Expected format: owner/repo`
    );
  }

  return { owner, repo };
}



/**
 * Get PR number from comment
 */
async function getPRNumber(
  octokit: Octokit,
  owner: string,
  repo: string,
  commentId: number,
  eventName: string
): Promise<number | null> {
  try {
    if (eventName === 'pull_request_review_comment') {
      const { data: comment } = await octokit.rest.pulls.getReviewComment({
        owner,
        repo,
        comment_id: commentId,
      });
      return comment.pull_request_url.split('/').pop()
        ? Number.parseInt(comment.pull_request_url.split('/').pop()!, 10)
        : null;
    } else if (eventName === 'issue_comment') {
      const { data: comment } = await octokit.rest.issues.getComment({
        owner,
        repo,
        comment_id: commentId,
      });
      // Check if this comment is on a PR (issues and PRs share the same API)
      const issueNumber = comment.issue_url.split('/').pop()
        ? Number.parseInt(comment.issue_url.split('/').pop()!, 10)
        : null;
      if (!issueNumber) return null;

      // Check if this issue is actually a PR
      try {
        await octokit.rest.pulls.get({
          owner,
          repo,
          pull_number: issueNumber,
        });
        return issueNumber;
      } catch {
        return null; // It's an issue, not a PR
      }
    }
    return null;
  } catch (error) {
    core.warning(`Failed to get PR number: ${error}`);
    return null;
  }
}

/**
 * Gather PR context including diff, comments, and metadata
 */
async function gatherPRContext(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
  commentId: number
): Promise<PRContext> {
  core.info(`📋 Gathering PR context for PR #${prNumber}...`);

  // Get PR details
  const { data: pr } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });

  // Get PR files
  const { data: files } = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber,
  });

  // Get the triggering comment
  const { data: triggeringComment } = await octokit.rest.issues.getComment({
    owner,
    repo,
    comment_id: commentId,
  });

  // Get all comments on the PR
  const { data: allComments } = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number: prNumber,
  });

  // Build comment thread (all comments for context)
  const commentThread = allComments.map(comment => ({
    author: comment.user?.login || 'unknown',
    body: comment.body || '',
    createdAt: comment.created_at,
  }));

  // Get diff
  const { data: diff } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
    mediaType: {
      format: 'diff',
    },
  });

  const context: PRContext = {
    prNumber,
    title: pr.title,
    description: pr.body || '',
    headBranch: pr.head.ref,
    baseBranch: pr.base.ref,
    diff: typeof diff === 'string' ? diff : '',
    filesChanged: files.map(file => ({
      filename: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      patch: file.patch,
    })),
    commentBody: triggeringComment.body || '',
    commentThread,
  };

  core.info(`✅ Gathered context: ${files.length} files changed`);
  return context;
}

/**
 * Configure git with GitHub Actions bot credentials
 */
async function configureGit(): Promise<void> {
  await exec.exec('git', ['config', 'user.name', 'github-actions[bot]']);
  await exec.exec('git', [
    'config',
    'user.email',
    'github-actions[bot]@users.noreply.github.com',
  ]);
}

/**
 * Commit and push changes
 */
async function commitAndPush(
  commentId: number,
  headBranch: string,
  githubToken: string,
  owner: string,
  repo: string
): Promise<void> {
  core.info('📝 Committing changes...');

  // Stage all changes
  await exec.exec('git', ['add', '-A']);

  // Check if there are changes to commit
  let hasChanges = false;
  await exec.exec('git', ['diff', '--cached', '--quiet'], {
    ignoreReturnCode: true,
    listeners: {
      errline: () => {
        hasChanges = true;
      },
    },
  });

  if (!hasChanges) {
    core.info('ℹ️ No changes to commit');
    return;
  }

  // Commit changes
  const commitMessage = `feat: implement changes requested in comment #${commentId}

Automatically generated by Auggie Assistant`;

  await exec.exec('git', ['commit', '-m', commitMessage]);

  // Push changes
  core.info(`🚀 Pushing to ${headBranch}...`);
  const remoteUrl = `https://x-access-token:${githubToken}@github.com/${owner}/${repo}.git`;
  await exec.exec('git', ['push', remoteUrl, `HEAD:${headBranch}`]);

  core.info('✅ Changes committed and pushed successfully');
}

/**
 * Invoke Auggie to implement changes
 */
async function invokeAuggie(context: PRContext): Promise<void> {
  core.info('🤖 Invoking Auggie to implement changes...');

  const augmentApiToken = process.env.AUGMENT_API_TOKEN;
  const augmentApiUrl = process.env.AUGMENT_API_URL;

  if (!augmentApiToken || !augmentApiUrl) {
    throw new Error(
      'AUGMENT_API_TOKEN and AUGMENT_API_URL must be set to use Auggie functionality'
    );
  }

  // Build context for Auggie
  const instruction = `You are an AI assistant helping to implement code changes in a Pull Request.

## User Request
${context.commentBody}

## PR Context
- **PR #${context.prNumber}**: ${context.title}
- **Description**: ${context.description}
- **Base Branch**: ${context.baseBranch}
- **Head Branch**: ${context.headBranch}

## Files Changed (${context.filesChanged.length} files)
${context.filesChanged.map(f => `- ${f.filename} (${f.status}): +${f.additions} -${f.deletions}`).join('\n')}

## Comment Thread
${context.commentThread.map(c => `**${c.author}** (${c.createdAt}):\n${c.body}`).join('\n\n---\n\n')}

## Current Diff
\`\`\`diff
${context.diff}
\`\`\`

## Instructions
You MUST actually implement the requested changes by editing the files. Do NOT just describe what you would do.
Use the str-replace-editor, save-file, or other file editing tools to make the actual changes to the code.
After making the changes, provide a brief summary of what you implemented.`;

  core.info('📤 Sending request to Auggie...');

  // Use Auggie SDK to implement changes
  try {
    // Initialize Auggie client
    core.info('🔧 Initializing Auggie client...');
    const auggie = await Auggie.create({
      apiKey: augmentApiToken,
      apiUrl: augmentApiUrl,
      workspaceRoot: process.cwd(),
      model: 'sonnet4.5',
      allowIndexing: true,
    });

    // Set up streaming to log tool usage and progress
    let currentToolName = '';
    auggie.onSessionUpdate(event => {
      switch (event.update.sessionUpdate) {
        case 'agent_message_chunk':
          // Stream agent text responses (optional - can be verbose)
          // if (event.update.content.type === 'text') {
          //   core.info(event.update.content.text);
          // }
          break;

        case 'tool_call':
          // Log when a tool starts executing
          currentToolName = event.update.title || 'unknown tool';
          core.info(`🔧 Tool: ${currentToolName}`);
          if (event.update.rawInput) {
            core.info(`   Input: ${JSON.stringify(event.update.rawInput)}`);
          }
          break;

        case 'tool_call_update':
          // Log when a tool finishes executing
          core.info(`✅ Tool completed: ${currentToolName}`);
          if (event.update.rawOutput) {
            const output = JSON.stringify(event.update.rawOutput);
            // Truncate long outputs
            const truncated = output.length > 200 ? `${output.substring(0, 200)}...` : output;
            core.info(`   Output: ${truncated}`);
          }
          break;

        default:
          // Log other session updates for debugging
          // core.debug(`Session update: ${event.update.sessionUpdate}`);
          break;
      }
    });

    // Send the instruction to Auggie
    core.info('💬 Sending instruction to Auggie...');
    const response = await auggie.prompt(instruction, { isAnswerOnly: true });

    core.info('📝 Auggie response:');
    core.info(response);

    // Close the Auggie connection
    await auggie.close();

    core.info('✅ Auggie completed successfully');
  } catch (error) {
    core.error(`Failed to invoke Auggie: ${error}`);
    throw error;
  }
}

/**
 * Add a comment to the PR
 */
async function addPRComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
  message: string
): Promise<void> {
  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body: message,
  });
}

/**
 * Main function
 */
async function main(): Promise<void> {
  try {
    // Get inputs
    const githubToken = getInput('github_token', true);
    const commentIdStr = getInput('comment_id', true);
    const eventName = getInput('event_name', true);

    // Validate inputs
    const commentId = Number.parseInt(commentIdStr, 10);
    if (Number.isNaN(commentId)) {
      throw new Error(`Invalid comment_id: ${commentIdStr}. Must be a number.`);
    }

    const { owner, repo } = parseRepository();

    // Create Octokit instance
    const octokit = new Octokit({ auth: githubToken });

    // Note: Reaction is added in action.yml for immediate feedback
    core.info(`🎯 Starting PR Assistant for comment ${commentId}`);
    core.info(`📦 Repository: ${owner}/${repo}`);
    core.info(`📝 Event: ${eventName}`);

    // Step 2: Get PR number
    core.info('🔍 Finding associated PR...');
    const prNumber = await getPRNumber(octokit, owner, repo, commentId, eventName);

    if (!prNumber) {
      core.info('ℹ️ Comment is not on a PR, skipping implementation');
      core.setOutput('success', 'true');
      return;
    }

    core.info(`✅ Found PR #${prNumber}`);

    // Step 3: Gather PR context
    const context = await gatherPRContext(octokit, owner, repo, prNumber, commentId);

    // Step 4: Configure git
    core.info('⚙️ Configuring git...');
    await configureGit();

    // Step 5: Invoke Auggie to implement changes
    try {
      await invokeAuggie(context);

      // Step 6: Commit and push changes
      await commitAndPush(commentId, context.headBranch, githubToken, owner, repo);

      // Step 7: Add success comment to PR
      await addPRComment(
        octokit,
        owner,
        repo,
        prNumber,
        `✅ Successfully implemented changes requested in [comment](https://github.com/${owner}/${repo}/issues/${prNumber}#issuecomment-${commentId})!

The changes have been committed to the \`${context.headBranch}\` branch.`
      );

      core.setOutput('success', 'true');
      core.info('✨ PR Assistant completed successfully');
    } catch (error) {
      // Add failure comment to PR
      await addPRComment(
        octokit,
        owner,
        repo,
        prNumber,
        `❌ Failed to implement changes requested in [comment](https://github.com/${owner}/${repo}/issues/${prNumber}#issuecomment-${commentId}).

Error: ${error instanceof Error ? error.message : String(error)}

Please check the [workflow logs](https://github.com/${owner}/${repo}/actions) for more details.`
      );
      throw error;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    core.setFailed(errorMessage);
    core.setOutput('success', 'false');
  }
}

// Run the action
main().catch(error => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  core.setFailed(`Unexpected error: ${errorMessage}`);
});

