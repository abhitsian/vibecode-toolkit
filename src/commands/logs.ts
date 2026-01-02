import { Command } from 'commander';
import chalk from 'chalk';

// Common noise patterns to filter out
const DEFAULT_NOISE_PATTERNS = [
  /webpack compiled/i,
  /compiled successfully/i,
  /compiled with \d+ warning/i,
  /hot[- ]?update/i,
  /hmr/i,
  /\[HMR\]/i,
  /\[webpack\]/i,
  /waiting for file changes/i,
  /hash: [a-f0-9]+/i,
  /chunk \{.*\}/i,
  /Time: \d+ms/i,
  /Built at:/i,
  /@ multi/i,
  /asset /i,
  /orphan modules/i,
  /code generated/i,
  /modules by path/i,
  /\+ \d+ modules/i,
  /vite v\d+/i,
  /ready in \d+/i,
  /Local:.*http/i,
  /Network:.*http/i,
  /bundled successfully/i,
];

// Patterns we definitely want to keep
const IMPORTANT_PATTERNS = [
  /error/i,
  /exception/i,
  /failed/i,
  /cannot/i,
  /undefined/i,
  /null reference/i,
  /syntax error/i,
  /404/i,
  /500/i,
  /warning/i,
  /deprecated/i,
];

interface LogsOptions {
  level?: 'error' | 'warn' | 'info' | 'all';
  follow?: boolean;
  include?: string;
  exclude?: string;
}

export function createLogsCommand(): Command {
  const command = new Command('logs');

  command
    .description('Filter development server logs to show only relevant information')
    .option('-l, --level <level>', 'Filter by level: error, warn, info, all', 'info')
    .option('-f, --follow', 'Follow log output in real-time (not yet implemented)')
    .option('-i, --include <pattern>', 'Include lines matching this pattern (regex)')
    .option('-e, --exclude <pattern>', 'Exclude lines matching this pattern (regex)')
    .action((options: LogsOptions) => {
      console.log(chalk.bold.cyan('\n🔍 Smart Log Filter\n'));
      console.log(chalk.dim('Paste your logs below (Ctrl+D when done):\n'));

      // Read from stdin
      const stdin = process.stdin;
      stdin.setEncoding('utf8');

      let buffer = '';

      stdin.on('data', (chunk) => {
        buffer += chunk;
      });

      stdin.on('end', () => {
        const filtered = filterLogs(buffer, options);
        console.log('\n' + chalk.bold.green('📝 Filtered Output:\n'));
        console.log(chalk.dim('─'.repeat(70)));
        console.log(filtered);
        console.log(chalk.dim('─'.repeat(70)));

        // Stats
        const originalLines = buffer.split('\n').length;
        const filteredLines = filtered.split('\n').filter(l => l.trim()).length;
        const removed = originalLines - filteredLines;

        console.log(chalk.dim(`\nRemoved ${removed} noise lines (${originalLines} → ${filteredLines} lines)`));
      });
    });

  return command;
}

function filterLogs(input: string, options: LogsOptions): string {
  const lines = input.split('\n');
  const filtered: string[] = [];

  // Custom patterns from options
  const customInclude = options.include ? new RegExp(options.include, 'i') : null;
  const customExclude = options.exclude ? new RegExp(options.exclude, 'i') : null;

  for (const line of lines) {
    if (!line.trim()) continue;

    // Custom exclude takes precedence
    if (customExclude && customExclude.test(line)) {
      continue;
    }

    // Custom include takes precedence
    if (customInclude && customInclude.test(line)) {
      filtered.push(highlightLine(line));
      continue;
    }

    // Always keep important lines
    const isImportant = IMPORTANT_PATTERNS.some(pattern => pattern.test(line));
    if (isImportant) {
      filtered.push(highlightLine(line, true));
      continue;
    }

    // Filter out noise
    const isNoise = DEFAULT_NOISE_PATTERNS.some(pattern => pattern.test(line));
    if (isNoise) {
      continue;
    }

    // Keep everything else based on level
    if (options.level === 'all') {
      filtered.push(line);
    } else if (options.level === 'error' && /error/i.test(line)) {
      filtered.push(highlightLine(line, true));
    } else if (options.level === 'warn' && /warn/i.test(line)) {
      filtered.push(highlightLine(line, true));
    } else if (options.level === 'info') {
      filtered.push(line);
    }
  }

  return filtered.join('\n');
}

function highlightLine(line: string, isImportant = false): string {
  if (isImportant) {
    if (/error/i.test(line)) {
      return chalk.red(line);
    } else if (/warn/i.test(line)) {
      return chalk.yellow(line);
    }
  }
  return line;
}
