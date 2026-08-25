import { spawn } from 'child_process';
import { env } from '../config/env';

/**
 * Probe Ghostscript availability once at startup by running `<gs> --version`.
 * Returns the version string, or null when missing/unreachable.
 */
export function checkGhostscript(): Promise<string | null> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (v: string | null): void => {
      if (!settled) {
        settled = true;
        resolve(v);
      }
    };

    try {
      const gs = spawn(env.gsPath, ['--version']);
      let out = '';

      gs.stdout?.on('data', (chunk: Buffer) => {
        out += chunk.toString().trim();
      });
      gs.on('error', () => done(null));
      gs.on('close', (code) => done(code === 0 && out ? out : null));

      // Never hang startup on a broken binary
      setTimeout(() => done(null), 5000).unref();
    } catch {
      done(null);
    }
  });
}
