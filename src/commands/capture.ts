import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { BugContext, CaptureOptions } from '../types/index.js';
import { captureScreenshot } from '../utils/screenshot.js';
import { getGitInfo, isGitRepo } from '../utils/git.js';
import { formatBugReport } from '../utils/formatter.js';
import { getBrowserCaptureInstructions } from '../utils/browser.js';

export function createCaptureCommand(): Command {
  const command = new Command('capture');

  command
    .description('Capture comprehensive bug context for debugging')
    .argument('[description]', 'Brief description of the bug')
    .option('-o, --output <path>', 'Output file path for the report')
    .option('--no-screenshot', 'Skip screenshot capture')
    .option('--no-git', 'Skip git information')
    .option('--browser-log <path>', 'Path to exported browser console log')
    .option('--clipboard', 'Copy summary to clipboard')
    .action(async (description: string | undefined, options: CaptureOptions) => {
      const spinner = ora('Capturing bug context...').start();

      try {
        const timestamp = new Date().toISOString();
        const context: BugContext = {
          timestamp,
          description,
          systemInfo: {
            platform: process.platform,
            arch: process.arch,
          },
        };

        // Get system info
        try {
          const bunVersion = await Bun.version;
          context.systemInfo!.bunVersion = bunVersion;
        } catch {
          // Bun version might not be available
        }

        // Capture screenshot
        if (options.screenshot !== false) {
          spinner.text = 'Waiting for screenshot...';
          try {
            const screenshotPath = await captureScreenshot({ interactive: true });
            context.screenshot = screenshotPath;
            spinner.succeed(`Screenshot saved: ${chalk.cyan(screenshotPath)}`);
            spinner.start('Continuing capture...');
          } catch (error) {
            spinner.warn(`Screenshot skipped: ${error}`);
            spinner.start('Continuing without screenshot...');
          }
        }

        // Get git information
        let gitInfo = null;
        if (options.git !== false) {
          spinner.text = 'Collecting git information...';
          if (await isGitRepo()) {
            gitInfo = await getGitInfo();
            if (gitInfo) {
              context.gitBranch = gitInfo.branch;
              context.gitCommit = gitInfo.commit;
              context.gitDiff = gitInfo.diff;
            }
          }
        }

        // Generate report
        spinner.text = 'Generating report...';
        const report = formatBugReport(context, gitInfo);

        // Ensure .vibe directory exists
        const vibeDir = join(process.cwd(), '.vibe');
        if (!existsSync(vibeDir)) {
          mkdirSync(vibeDir, { recursive: true });
        }

        // Save to file
        const outputPath = options.output || join(vibeDir, `report-${Date.now()}.md`);
        writeFileSync(outputPath, report);

        spinner.succeed(chalk.green('Bug context captured successfully!'));

        // Display summary
        console.log('\n' + chalk.bold('📋 Capture Summary:'));
        console.log(chalk.dim('─'.repeat(50)));

        if (description) {
          console.log(chalk.yellow('Description:'), description);
        }

        if (context.screenshot) {
          console.log(chalk.yellow('Screenshot:'), chalk.cyan(context.screenshot));
        }

        if (gitInfo) {
          console.log(chalk.yellow('Git Branch:'), gitInfo.branch);
          console.log(chalk.yellow('Git Commit:'), gitInfo.commit);
          if (gitInfo.hasChanges) {
            console.log(chalk.yellow('Changes:'), chalk.red('Uncommitted changes detected'));
          }
        }

        console.log(chalk.yellow('Report:'), chalk.cyan(outputPath));
        console.log(chalk.dim('─'.repeat(50)));

        console.log('\n' + chalk.bold('📝 Next Steps:'));
        console.log(chalk.dim('1.'), 'Review the report:', chalk.cyan(outputPath));
        console.log(chalk.dim('2.'), 'Share it with Claude Code to debug the issue');
        console.log(chalk.dim('3.'), 'Or run:', chalk.cyan(`cat ${outputPath} | pbcopy`), '(macOS)');

        console.log('\n' + chalk.dim('💡 Tip: Use'), chalk.cyan('--browser-log <path>'), chalk.dim('to include browser console'));
        console.log(chalk.dim(getBrowserCaptureInstructions()));

      } catch (error) {
        spinner.fail(chalk.red('Failed to capture bug context'));
        console.error(error);
        process.exit(1);
      }
    });

  return command;
}
