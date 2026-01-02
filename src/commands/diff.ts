import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getGitInfo, getSmartDiff, getAllDiffs, isGitRepo } from '../utils/git.js';

export function createDiffCommand(): Command {
  const command = new Command('diff');

  command
    .description('Smart git diff with context and Claude-friendly formatting')
    .option('-a, --all', 'Show both staged and unstaged changes')
    .option('-c, --context <lines>', 'Number of context lines (default: 10)', '10')
    .option('-s, --stats', 'Show git statistics')
    .action(async (options: { all?: boolean; context?: string; stats?: boolean }) => {
      const spinner = ora('Loading git information...').start();

      try {
        if (!(await isGitRepo())) {
          spinner.fail(chalk.red('Not a git repository'));
          console.log(chalk.dim('Initialize with:'), chalk.cyan('git init'));
          process.exit(1);
        }

        const gitInfo = await getGitInfo();
        if (!gitInfo) {
          spinner.fail(chalk.red('Failed to get git information'));
          process.exit(1);
        }

        spinner.succeed(chalk.green('Git information loaded'));

        console.log('\n' + chalk.bold.cyan('📊 Git Context\n'));
        console.log(chalk.dim('─'.repeat(70)));
        console.log(chalk.yellow('Branch:'), chalk.cyan(gitInfo.branch));
        console.log(chalk.yellow('Commit:'), chalk.cyan(gitInfo.commit));
        console.log(chalk.yellow('Status:'), gitInfo.hasChanges ? chalk.red('Uncommitted changes') : chalk.green('Clean'));
        console.log(chalk.dim('─'.repeat(70)));
        console.log('');

        // Show recent commits
        if (gitInfo.recentCommits && gitInfo.recentCommits.length > 0) {
          console.log(chalk.bold('Recent Commits:\n'));
          gitInfo.recentCommits.forEach(commit => {
            console.log(chalk.dim('  ' + commit));
          });
          console.log('');
        }

        // Show stats if requested
        if (options.stats) {
          spinner.start('Computing statistics...');
          const stats = await computeGitStats();
          spinner.succeed('Statistics computed');
          console.log(chalk.bold('Statistics:\n'));
          console.log(stats);
          console.log('');
        }

        // Show diff
        if (gitInfo.hasChanges) {
          console.log(chalk.bold.yellow('📝 Changes:\n'));
          console.log(chalk.dim('─'.repeat(70)));

          let diff: string;
          if (options.all) {
            diff = await getAllDiffs();
          } else {
            diff = await getSmartDiff();
          }

          if (diff) {
            // Highlight the diff
            const highlighted = highlightDiff(diff);
            console.log(highlighted);
          } else {
            console.log(chalk.dim('No changes to display'));
          }

          console.log(chalk.dim('─'.repeat(70)));
          console.log('');

          // Claude-ready summary
          console.log(chalk.bold.blue('📋 Claude-ready summary:\n'));
          console.log(chalk.dim('─'.repeat(70)));
          console.log(generateClaudeSummary(gitInfo, diff || ''));
          console.log(chalk.dim('─'.repeat(70)));
          console.log('');

        } else {
          console.log(chalk.green('✓ No uncommitted changes\n'));
        }

      } catch (error) {
        spinner.fail(chalk.red('Failed to get diff'));
        console.error(error);
        process.exit(1);
      }
    });

  return command;
}

function highlightDiff(diff: string): string {
  return diff
    .split('\n')
    .map(line => {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        return chalk.green(line);
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        return chalk.red(line);
      } else if (line.startsWith('@@')) {
        return chalk.cyan(line);
      } else if (line.startsWith('diff --git')) {
        return chalk.bold(line);
      }
      return chalk.dim(line);
    })
    .join('\n');
}

async function computeGitStats(): Promise<string> {
  try {
    const { $ } = await import('bun');
    const stats = await $`git diff --stat`.text();
    return stats;
  } catch {
    return 'Unable to compute statistics';
  }
}

function generateClaudeSummary(gitInfo: any, diff: string): string {
  const lines: string[] = [];

  lines.push('I have the following uncommitted changes:');
  lines.push('');
  lines.push(`Branch: ${gitInfo.branch}`);
  lines.push(`Commit: ${gitInfo.commit}`);
  lines.push('');

  if (gitInfo.status) {
    lines.push('Files changed:');
    lines.push('```');
    lines.push(gitInfo.status);
    lines.push('```');
    lines.push('');
  }

  if (diff) {
    const diffLines = diff.split('\n');
    const truncated = diffLines.length > 100;
    const displayDiff = truncated ? diffLines.slice(0, 100).join('\n') : diff;

    lines.push('Changes:');
    lines.push('```diff');
    lines.push(displayDiff);
    if (truncated) {
      lines.push('... (diff truncated for brevity)');
    }
    lines.push('```');
    lines.push('');
  }

  lines.push('Can you help me:');
  lines.push('1. Review these changes for any issues');
  lines.push('2. Suggest improvements');
  lines.push('3. Generate a commit message');

  return lines.join('\n');
}
