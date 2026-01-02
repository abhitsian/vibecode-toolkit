import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { captureScreenshot } from '../utils/screenshot.js';
import type { SnapshotData } from '../types/index.js';

const SNAPSHOTS_FILE = join(process.cwd(), '.vibe', 'snapshots.json');

export function createSnapshotCommand(): Command {
  const command = new Command('snapshot');

  command
    .description('Capture before/after screenshots for visual comparison')
    .argument('<name>', 'Name for this snapshot')
    .option('-c, --compare <name>', 'Compare with a previous snapshot')
    .option('-l, --list', 'List all snapshots')
    .option('-d, --delete <name>', 'Delete a snapshot')
    .action(async (name: string, options: { compare?: string; list?: boolean; delete?: string }) => {
      // Ensure snapshots directory exists
      const vibeDir = join(process.cwd(), '.vibe');
      if (!existsSync(vibeDir)) {
        mkdirSync(vibeDir, { recursive: true });
      }

      // Handle list
      if (options.list) {
        listSnapshots();
        return;
      }

      // Handle delete
      if (options.delete) {
        deleteSnapshot(options.delete);
        return;
      }

      // Handle compare
      if (options.compare) {
        await compareSnapshots(name, options.compare);
        return;
      }

      // Capture new snapshot
      await captureNewSnapshot(name);
    });

  return command;
}

async function captureNewSnapshot(name: string) {
  const spinner = ora(`Capturing snapshot: ${name}`).start();

  try {
    spinner.text = 'Waiting for screenshot...';
    const screenshotPath = await captureScreenshot({
      interactive: true,
      output: `snapshot-${name}-${Date.now()}.png`,
    });

    // Read snapshots
    const snapshots = loadSnapshots();

    // Create hash of the screenshot for comparison
    const file = Bun.file(screenshotPath);
    const buffer = await file.arrayBuffer();
    const hash = Bun.hash(buffer).toString();

    // Save snapshot data
    const snapshot: SnapshotData = {
      name,
      timestamp: new Date().toISOString(),
      screenshot: screenshotPath,
      hash,
    };

    snapshots[name] = snapshot;
    saveSnapshots(snapshots);

    spinner.succeed(chalk.green(`Snapshot saved: ${name}`));
    console.log(chalk.dim(`  Screenshot: ${screenshotPath}`));
    console.log(chalk.dim(`  Hash: ${hash}`));
    console.log('');
    console.log(chalk.dim('💡 Tip: Run'), chalk.cyan(`vibe snapshot ${name} --compare <previous-name>`), chalk.dim('to compare'));
  } catch (error) {
    spinner.fail(chalk.red('Failed to capture snapshot'));
    console.error(error);
    process.exit(1);
  }
}

async function compareSnapshots(newName: string, oldName: string) {
  const spinner = ora('Comparing snapshots...').start();

  try {
    const snapshots = loadSnapshots();

    if (!snapshots[oldName]) {
      spinner.fail(chalk.red(`Snapshot not found: ${oldName}`));
      console.log(chalk.dim('Available snapshots:'));
      Object.keys(snapshots).forEach(name => {
        console.log(chalk.dim(`  - ${name}`));
      });
      process.exit(1);
    }

    // Capture new snapshot
    spinner.text = 'Capturing new screenshot...';
    const newScreenshotPath = await captureScreenshot({
      interactive: true,
      output: `snapshot-${newName}-${Date.now()}.png`,
    });

    const newFile = Bun.file(newScreenshotPath);
    const newBuffer = await newFile.arrayBuffer();
    const newHash = Bun.hash(newBuffer).toString();

    const oldSnapshot = snapshots[oldName];
    const oldHash = oldSnapshot.hash;

    spinner.succeed(chalk.green('Comparison complete!'));
    console.log('');
    console.log(chalk.bold('📊 Snapshot Comparison:\n'));
    console.log(chalk.dim('─'.repeat(70)));
    console.log(chalk.yellow('Before:'), chalk.cyan(oldName));
    console.log(chalk.dim(`  Screenshot: ${oldSnapshot.screenshot}`));
    console.log(chalk.dim(`  Timestamp: ${oldSnapshot.timestamp}`));
    console.log(chalk.dim(`  Hash: ${oldHash}`));
    console.log('');
    console.log(chalk.yellow('After:'), chalk.cyan(newName));
    console.log(chalk.dim(`  Screenshot: ${newScreenshotPath}`));
    console.log(chalk.dim(`  Timestamp: ${new Date().toISOString()}`));
    console.log(chalk.dim(`  Hash: ${newHash}`));
    console.log('');

    if (oldHash === newHash) {
      console.log(chalk.green('✓ Screenshots are identical - no visual changes detected'));
    } else {
      console.log(chalk.yellow('⚠ Screenshots differ - visual changes detected'));
    }

    console.log(chalk.dim('─'.repeat(70)));
    console.log('');
    console.log(chalk.dim('💡 To view differences:'));
    console.log(chalk.dim(`  1. Open: ${oldSnapshot.screenshot}`));
    console.log(chalk.dim(`  2. Open: ${newScreenshotPath}`));
    console.log(chalk.dim(`  3. Compare side-by-side`));

    // Save new snapshot
    snapshots[newName] = {
      name: newName,
      timestamp: new Date().toISOString(),
      screenshot: newScreenshotPath,
      hash: newHash,
    };
    saveSnapshots(snapshots);

  } catch (error) {
    spinner.fail(chalk.red('Comparison failed'));
    console.error(error);
    process.exit(1);
  }
}

function listSnapshots() {
  const snapshots = loadSnapshots();
  const names = Object.keys(snapshots);

  if (names.length === 0) {
    console.log(chalk.yellow('\nNo snapshots found.'));
    console.log(chalk.dim('Create one with:'), chalk.cyan('vibe snapshot <name>'));
    console.log('');
    return;
  }

  console.log(chalk.bold.cyan('\n📸 Saved Snapshots:\n'));
  console.log(chalk.dim('─'.repeat(70)));

  names.forEach(name => {
    const snapshot = snapshots[name];
    console.log(chalk.yellow(name));
    console.log(chalk.dim(`  Captured: ${new Date(snapshot.timestamp).toLocaleString()}`));
    console.log(chalk.dim(`  File: ${snapshot.screenshot}`));
    console.log('');
  });

  console.log(chalk.dim('─'.repeat(70)));
  console.log('');
}

function deleteSnapshot(name: string) {
  const snapshots = loadSnapshots();

  if (!snapshots[name]) {
    console.log(chalk.red(`\nSnapshot not found: ${name}`));
    return;
  }

  delete snapshots[name];
  saveSnapshots(snapshots);

  console.log(chalk.green(`\n✓ Deleted snapshot: ${name}\n`));
}

function loadSnapshots(): Record<string, SnapshotData> {
  if (!existsSync(SNAPSHOTS_FILE)) {
    return {};
  }

  try {
    const data = readFileSync(SNAPSHOTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function saveSnapshots(snapshots: Record<string, SnapshotData>) {
  writeFileSync(SNAPSHOTS_FILE, JSON.stringify(snapshots, null, 2));
}
