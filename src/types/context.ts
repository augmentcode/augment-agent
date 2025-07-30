/**
 * Context-related type definitions
 */

import { PullRequestFile } from './github';

export interface GithubRepo {
  full_name: string;
  name: string;
  owner: string;
}

export interface GitRef {
  ref: string;
  sha: string;
  repo: GithubRepo;
}

export interface PRData {
  number: number;
  title: string;
  author: string;
  head: GitRef;
  base: GitRef;
  body: string;
  state: string;
  changed_files: string; // Newline-separated list of filenames
  changed_files_list: Array<PullRequestFile>;
  diff_file: string;
}

export interface TemplateContext {
  // PR-related context (if PR info provided)
  pr?: PRData;

  // Custom context (parsed from JSON)
  custom?: Record<string, any>;
}
