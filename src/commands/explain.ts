import { Command } from 'commander';
import chalk from 'chalk';

interface ErrorPattern {
  pattern: RegExp;
  explanation: string;
  commonCauses: string[];
  quickFix?: string;
}

const ERROR_PATTERNS: ErrorPattern[] = [
  {
    pattern: /Cannot read propert(?:y|ies) of undefined \(reading '(.+?)'\)/i,
    explanation: "You're trying to access a property on an object that doesn't exist (undefined).",
    commonCauses: [
      'The variable was never initialized',
      'An async operation hasn\'t completed yet',
      'A function returned undefined instead of an object',
      'Optional chaining was needed but not used',
    ],
    quickFix: 'Add a null check: `if (obj) { obj.property }` or use optional chaining: `obj?.property`',
  },
  {
    pattern: /Cannot read propert(?:y|ies) of null \(reading '(.+?)'\)/i,
    explanation: "You're trying to access a property on a null value.",
    commonCauses: [
      'A function explicitly returned null',
      'DOM element not found (querySelector returned null)',
      'API response was null',
    ],
    quickFix: 'Add a null check or use optional chaining: `obj?.property`',
  },
  {
    pattern: /(.+?) is not a function/i,
    explanation: "You're trying to call something that isn't a function.",
    commonCauses: [
      'Typo in the function name',
      'The variable holds a different type than expected',
      'The function wasn\'t imported correctly',
      'Destructuring error (calling the wrong property)',
    ],
    quickFix: 'Check that the variable is actually a function. Use `typeof x === "function"` to verify.',
  },
  {
    pattern: /Unexpected token/i,
    explanation: 'JavaScript encountered syntax it didn\'t expect.',
    commonCauses: [
      'Missing comma in object/array',
      'Unclosed bracket, brace, or parenthesis',
      'Using reserved keywords incorrectly',
      'JSX without proper transpilation',
    ],
    quickFix: 'Check for syntax errors like missing commas, brackets, or quotes.',
  },
  {
    pattern: /Module not found|Cannot find module/i,
    explanation: 'The import/require statement is trying to load a module that doesn\'t exist.',
    commonCauses: [
      'Package not installed (run npm/bun install)',
      'Wrong file path in import',
      'Missing file extension (.js, .ts, .jsx)',
      'Case sensitivity in file path',
    ],
    quickFix: 'Run `bun install` or check the import path for typos.',
  },
  {
    pattern: /EADDRINUSE.*:(\d+)/i,
    explanation: 'The port is already in use by another process.',
    commonCauses: [
      'Development server already running',
      'Another application using the same port',
      'Zombie process from previous crash',
    ],
    quickFix: 'Kill the process using: `lsof -ti:PORT | xargs kill -9` or change the port.',
  },
  {
    pattern: /CORS|Cross-Origin/i,
    explanation: 'Browser blocked the request due to Cross-Origin Resource Sharing policy.',
    commonCauses: [
      'API server doesn\'t allow requests from your origin',
      'Missing CORS headers on server',
      'Trying to access localhost from different port',
    ],
    quickFix: 'Add CORS headers on the server or use a proxy in development.',
  },
  {
    pattern: /401|Unauthorized/i,
    explanation: 'Authentication failed or credentials are missing.',
    commonCauses: [
      'Missing or invalid auth token',
      'Token expired',
      'Wrong credentials',
    ],
    quickFix: 'Check authentication headers and ensure valid credentials are sent.',
  },
  {
    pattern: /404|Not Found/i,
    explanation: 'The requested resource doesn\'t exist.',
    commonCauses: [
      'Wrong URL or endpoint',
      'Resource was deleted',
      'Route not configured on server',
    ],
    quickFix: 'Verify the URL/endpoint is correct and the resource exists.',
  },
  {
    pattern: /500|Internal Server Error/i,
    explanation: 'The server encountered an unexpected error.',
    commonCauses: [
      'Unhandled exception in server code',
      'Database connection failed',
      'Missing environment variables',
    ],
    quickFix: 'Check server logs for the actual error. Add error handling in server code.',
  },
];

export function createExplainCommand(): Command {
  const command = new Command('explain');

  command
    .description('Translate cryptic errors into human-readable explanations')
    .argument('[error]', 'Error message to explain')
    .option('-v, --verbose', 'Show detailed analysis')
    .action((error: string | undefined, options: { verbose?: boolean }) => {
      if (!error) {
        // Read from stdin
        console.log(chalk.bold.cyan('\n💡 Error Explainer\n'));
        console.log(chalk.dim('Paste your error message below (Ctrl+D when done):\n'));

        const stdin = process.stdin;
        stdin.setEncoding('utf8');
        let buffer = '';

        stdin.on('data', (chunk) => {
          buffer += chunk;
        });

        stdin.on('end', () => {
          explainError(buffer.trim(), options.verbose || false);
        });
      } else {
        explainError(error, options.verbose || false);
      }
    });

  return command;
}

function explainError(errorMessage: string, verbose: boolean) {
  console.log(chalk.bold.yellow('\n⚠️  Error:\n'));
  console.log(chalk.dim(errorMessage));
  console.log('');

  // Find matching pattern
  let matched = false;
  for (const { pattern, explanation, commonCauses, quickFix } of ERROR_PATTERNS) {
    if (pattern.test(errorMessage)) {
      matched = true;

      console.log(chalk.bold.green('📖 What this means:\n'));
      console.log(explanation);
      console.log('');

      console.log(chalk.bold.cyan('🔍 Common causes:\n'));
      commonCauses.forEach((cause, i) => {
        console.log(chalk.dim(`${i + 1}.`), cause);
      });
      console.log('');

      if (quickFix) {
        console.log(chalk.bold.magenta('⚡ Quick fix:\n'));
        console.log(quickFix);
        console.log('');
      }

      break;
    }
  }

  if (!matched) {
    console.log(chalk.yellow('No specific explanation found for this error.'));
    console.log('');
    console.log(chalk.dim('💡 Tip: Try searching for the error on:'));
    console.log(chalk.dim('  - Stack Overflow'));
    console.log(chalk.dim('  - The library\'s GitHub issues'));
    console.log(chalk.dim('  - Or ask Claude Code directly!'));
    console.log('');
  }

  // Generate Claude-ready prompt
  console.log(chalk.bold.blue('📋 Claude-ready prompt:\n'));
  console.log(chalk.dim('─'.repeat(70)));
  console.log(generateClaudePrompt(errorMessage));
  console.log(chalk.dim('─'.repeat(70)));
  console.log('');
  console.log(chalk.dim('Copy the above prompt to get help from Claude Code'));
  console.log('');
}

function generateClaudePrompt(error: string): string {
  return `I'm getting this error:

\`\`\`
${error}
\`\`\`

Can you help me:
1. Explain what's causing this error
2. Show me how to fix it
3. Suggest how to prevent it in the future

Context:
- [Describe what you were doing when the error occurred]
- [Relevant code snippet if available]
- [Framework/library versions if relevant]`;
}
