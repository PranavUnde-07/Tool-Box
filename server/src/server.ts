import http from 'http';
import app from './app';
import { env } from './config/env';
import { cleanDir, startTempSweeper } from './utils/fileCleanup';
import { checkGhostscript } from './utils/ghostscript';

const server = http.createServer(app);

/* ─────────────── Background hygiene ─────────────── */
startTempSweeper([env.tempUploadsDir, env.tempGeneratedDir]);

void checkGhostscript().then((version) => {
  if (!version) {
    console.warn(
      '  ⚠️  Ghostscript not found — "Compress PDF" and "PDF to Images" will be unavailable.\n' +
      '     Install it or set GS_PATH in server/.env',
    );
  }
});

/* ─────────────── Start ─────────────── */
server.listen(env.port, () => {
  console.log('');
  console.log('  ████████╗ ██████╗  ██████╗ ██╗     ██████╗  ██████╗ ██╗  ██╗');
  console.log('     ██╔══╝██╔═══██╗██╔═══██╗██║     ██╔══██╗██╔═══██╗╚██╗██╔╝');
  console.log('     ██║   ██║   ██║██║   ██║██║     ██╔══██╗██║   ██║ ╚███╔╝ ');
  console.log('     ██║   ██║   ██║██║   ██║██║     ██████╔╝██████╔╝██╔╝ ██╗');
  console.log('     ██║   ╚██████╔╝╚██████╔╝███████╗██████╔╝╚██████╔╝██╔╝ ██╗');
  console.log('     ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝');
  console.log('');
  console.log(`  🧰  Local-First File Processing Backend`);
  console.log(`  ⚡  Running on http://localhost:${env.port}`);
  console.log(`  🌐  CORS origin: ${env.corsOrigin}`);
  console.log(`  🔒  Privacy-first — no files are permanently stored`);
  console.log(`  🖥️   Mode: ${env.nodeEnv}`);
  console.log('');
});

/* ─────────────── Graceful Shutdown ─────────────── */
function shutdown(signal: string): void {
  console.log(`\n  [${signal}] Shutting down server...`);

  // Clean up any leftover temp files
  cleanDir(env.tempUploadsDir);
  cleanDir(env.tempGeneratedDir);

  server.close(() => {
    console.log('  Server closed. Goodbye.\n');
    process.exit(0);
  });

  // Force exit after 5 seconds if server hasn't closed
  setTimeout(() => {
    process.exit(1);
  }, 5000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

/* ─────────────── Unhandled Rejections ─────────────── */
process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
  shutdown('UNCAUGHT_EXCEPTION');
});

export default server;
