#!/usr/bin/env bun

import { Command } from 'commander';
import chalk from 'chalk';
import { createCaptureCommand } from './commands/capture.js';
import { createLogsCommand } from './commands/logs.js';
import { createExplainCommand } from './commands/explain.js';
import { createSnapshotCommand } from './commands/snapshot.js';
import { createDiffCommand } from './commands/diff.js';

const program = new Command();

program
  .name('vibe')
  .description('VibeDev Toolkit - Tools for better vibecoding')
  .version('0.1.0');

// Add commands
program.addCommand(createCaptureCommand());
program.addCommand(createLogsCommand());
program.addCommand(createExplainCommand());
program.addCommand(createSnapshotCommand());
program.addCommand(createDiffCommand());

// Display help by default if no command provided
if (process.argv.length === 2) {
  displayWelcome();
  program.help();
}

program.parse();

function displayWelcome() {
  console.log(chalk.bold.cyan('\n🎸 VibeDev Toolkit\n'));
  console.log(chalk.dim('A comprehensive toolkit for vibecoders\n'));
  console.log(chalk.yellow('Available commands:'));
  console.log(chalk.dim('  capture   - Capture comprehensive bug context'));
  console.log(chalk.dim('  logs      - Filter dev server noise'));
  console.log(chalk.dim('  explain   - Translate cryptic errors'));
  console.log(chalk.dim('  snapshot  - Before/after screenshots'));
  console.log(chalk.dim('  diff      - Smart git diffs'));
  console.log('');
}
