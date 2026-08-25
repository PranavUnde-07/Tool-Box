import fs from 'fs';
import path from 'path';

/**
 * Safely delete a single file. Swallows errors — cleanup should never crash the server.
 */
export function deleteFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Intentionally silent — temp cleanup must never propagate errors
  }
}

/**
 * Delete multiple files.
 */
export function deleteFiles(filePaths: string[]): void {
  for (const fp of filePaths) {
    deleteFile(fp);
  }
}

/**
 * Recursively delete all contents of a directory without removing the directory itself.
 */
export function cleanDir(dirPath: string): void {
  try {
    if (!fs.existsSync(dirPath)) return;
    const entries = fs.readdirSync(dirPath);
    for (const entry of entries) {
      const full = path.join(dirPath, entry);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        fs.rmSync(full, { recursive: true, force: true });
      } else {
        fs.unlinkSync(full);
      }
    }
  } catch {
    // Silent
  }
}

/**
 * Ensure a directory exists, creating it recursively if not.
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Schedule file deletion after a response has been sent.
 * Uses a short delay so the stream has time to flush.
 */
export function scheduleCleanup(filePaths: string[], delayMs = 2000): void {
  setTimeout(() => {
    deleteFiles(filePaths);
  }, delayMs);
}

/**
 * Periodically sweep temp directories for orphaned files — e.g. uploads left
 * behind when the process crashed mid-request or a client aborted early.
 * Deletes anything older than `maxAgeMs`. The interval is unref'd so it
 * never keeps the event loop alive.
 */
export function startTempSweeper(dirs: string[], maxAgeMs = 10 * 60 * 1000, intervalMs = 5 * 60 * 1000): void {
  const sweep = (): void => {
    const now = Date.now();
    for (const dir of dirs) {
      try {
        if (!fs.existsSync(dir)) continue;
        for (const entry of fs.readdirSync(dir)) {
          const full = path.join(dir, entry);
          try {
            const stat = fs.statSync(full);
            if (stat.isFile() && now - stat.mtimeMs > maxAgeMs) {
              deleteFile(full);
            }
          } catch {
            // Skip entries that vanish between readdir and stat
          }
        }
      } catch {
        // Silent — sweeping must never crash the server
      }
    }
  };

  sweep();
  const timer = setInterval(sweep, intervalMs);
  timer.unref();
}
