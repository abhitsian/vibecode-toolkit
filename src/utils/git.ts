import { $ } from "bun";

export interface GitInfo {
  branch?: string;
  commit?: string;
  diff?: string;
  status?: string;
  hasChanges: boolean;
  recentCommits?: string[];
}

/**
 * Checks if the current directory is a git repository
 */
export async function isGitRepo(): Promise<boolean> {
  try {
    await $`git rev-parse --git-dir`.quiet();
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets comprehensive git information
 */
export async function getGitInfo(): Promise<GitInfo | null> {
  if (!(await isGitRepo())) {
    return null;
  }

  try {
    const branch = await $`git rev-parse --abbrev-ref HEAD`.text();
    const commit = await $`git rev-parse --short HEAD`.text();
    const diff = await $`git diff`.text();
    const status = await $`git status --short`.text();
    const recentCommitsRaw = await $`git log --oneline -5`.text();

    const recentCommits = recentCommitsRaw
      .trim()
      .split('\n')
      .filter(line => line.trim());

    const hasChanges = diff.trim().length > 0 || status.trim().length > 0;

    return {
      branch: branch.trim(),
      commit: commit.trim(),
      diff: diff.trim(),
      status: status.trim(),
      hasChanges,
      recentCommits,
    };
  } catch (error) {
    console.error('Error getting git info:', error);
    return null;
  }
}

/**
 * Gets a smart diff with context (full function/class context)
 */
export async function getSmartDiff(): Promise<string> {
  if (!(await isGitRepo())) {
    return '';
  }

  try {
    // Get diff with more context lines (10 before and after)
    const diff = await $`git diff -U10`.text();
    return diff;
  } catch {
    return '';
  }
}

/**
 * Gets the diff of unstaged AND staged changes
 */
export async function getAllDiffs(): Promise<string> {
  if (!(await isGitRepo())) {
    return '';
  }

  try {
    const unstaged = await $`git diff`.text();
    const staged = await $`git diff --cached`.text();

    let result = '';
    if (staged.trim()) {
      result += '# Staged changes:\n\n' + staged + '\n\n';
    }
    if (unstaged.trim()) {
      result += '# Unstaged changes:\n\n' + unstaged;
    }

    return result.trim();
  } catch {
    return '';
  }
}
