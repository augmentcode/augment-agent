#!/usr/bin/env node

/**
 * Comment Reaction GitHub Action
 * Adds emoji reactions to GitHub comments
 */

import * as core from '@actions/core';
import { Octokit } from '@octokit/rest';

/**
 * Valid GitHub reaction types
 */
const VALID_REACTIONS = [
  '+1',
  '-1',
  'laugh',
  'confused',
  'heart',
  'hooray',
  'rocket',
  'eyes',
] as const;

type ReactionType = (typeof VALID_REACTIONS)[number];

/**
 * Get input from environment variables (GitHub Actions pattern)
 */
function getInput(name: string, required: boolean = false): string {
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
 * Validate reaction type
 */
function validateReaction(reaction: string): ReactionType {
  if (!VALID_REACTIONS.includes(reaction as ReactionType)) {
    throw new Error(
      `Invalid reaction type: ${reaction}. Valid reactions: ${VALID_REACTIONS.join(', ')}`
    );
  }
  return reaction as ReactionType;
}

/**
 * Add reaction to a comment
 */
async function addReaction(
  octokit: Octokit,
  owner: string,
  repo: string,
  commentId: number,
  eventName: string,
  reaction: ReactionType
): Promise<void> {
  try {
    if (eventName === 'pull_request_review_comment') {
      await octokit.rest.reactions.createForPullRequestReviewComment({
        owner,
        repo,
        comment_id: commentId,
        content: reaction,
      });
      core.info(`✅ Added :${reaction}: reaction to PR review comment ${commentId}`);
    } else if (eventName === 'issue_comment') {
      await octokit.rest.reactions.createForIssueComment({
        owner,
        repo,
        comment_id: commentId,
        content: reaction,
      });
      core.info(`✅ Added :${reaction}: reaction to issue comment ${commentId}`);
    } else {
      throw new Error(
        `Unsupported event type: ${eventName}. Supported: pull_request_review_comment, issue_comment`
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      const apiError = error as any;
      const requestId = apiError.response?.headers?.['x-github-request-id'] || 'unknown';
      const status = apiError.status || '';
      throw new Error(
        `Failed to add :${reaction}: reaction (${status}): ${error.message}; requestId=${requestId}`
      );
    }
    throw error;
  }
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
    const reactionInput = getInput('reaction') || 'eyes';

    // Validate inputs
    const commentId = parseInt(commentIdStr, 10);
    if (isNaN(commentId)) {
      throw new Error(`Invalid comment_id: ${commentIdStr}. Must be a number.`);
    }

    const reaction = validateReaction(reactionInput);
    const { owner, repo } = parseRepository();

    core.info(`🎯 Adding :${reaction}: reaction to comment ${commentId}`);
    core.info(`📦 Repository: ${owner}/${repo}`);
    core.info(`📝 Event: ${eventName}`);

    // Create Octokit instance
    const octokit = new Octokit({ auth: githubToken });

    // Add reaction
    await addReaction(octokit, owner, repo, commentId, eventName, reaction);

    // Set output
    core.setOutput('success', 'true');
    core.info('✨ Comment reaction completed successfully');
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

