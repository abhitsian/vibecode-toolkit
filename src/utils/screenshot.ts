import { $ } from "bun";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

export interface ScreenshotOptions {
  output?: string;
  interactive?: boolean;
  window?: boolean;
  region?: boolean;
}

/**
 * Captures a screenshot using platform-specific tools
 */
export async function captureScreenshot(options: ScreenshotOptions = {}): Promise<string> {
  const platform = process.platform;
  const timestamp = Date.now();
  const defaultOutput = options.output || `vibe-capture-${timestamp}.png`;

  // Ensure output directory exists
  const outputDir = join(process.cwd(), '.vibe');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = join(outputDir, defaultOutput);

  try {
    if (platform === 'darwin') {
      // macOS: use screencapture
      const args = ['-i']; // interactive by default
      if (options.window) args.push('-w'); // capture window
      args.push(outputPath);

      await $`screencapture ${args}`.quiet();

    } else if (platform === 'linux') {
      // Linux: try various tools
      const hasScrot = await commandExists('scrot');
      const hasGnomeScreenshot = await commandExists('gnome-screenshot');

      if (hasScrot) {
        await $`scrot -s ${outputPath}`.quiet();
      } else if (hasGnomeScreenshot) {
        await $`gnome-screenshot -a -f ${outputPath}`.quiet();
      } else {
        throw new Error('No screenshot tool found. Install scrot or gnome-screenshot');
      }

    } else if (platform === 'win32') {
      // Windows: use PowerShell
      throw new Error('Windows screenshot not yet implemented. Please use Snipping Tool manually.');
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    if (!existsSync(outputPath)) {
      throw new Error('Screenshot was cancelled or failed');
    }

    return outputPath;
  } catch (error) {
    throw new Error(`Screenshot failed: ${error}`);
  }
}

/**
 * Check if a command exists in PATH
 */
async function commandExists(command: string): Promise<boolean> {
  try {
    await $`which ${command}`.quiet();
    return true;
  } catch {
    return false;
  }
}
