#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FRONTEND_PORT = 5173;

async function start() {
  console.log('🚀 Starting frontend development server...');
  
  try {
    const viteExecutable = join(__dirname, '..', 'node_modules', '.bin', 'vite');
    const frontendProcess = spawn(viteExecutable, ['--port', FRONTEND_PORT, '--host'], {
      stdio: 'inherit',
      shell: true
    });

    frontendProcess.on('error', (err) => {
      console.error('Frontend process error:', err);
      process.exit(1);
    });

    // Handle process termination
    ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
      process.on(signal, () => {
        console.log(`\nReceived ${signal}, cleaning up...`);
        if (!frontendProcess.killed) {
          frontendProcess.kill();
        }
        process.exit();
      });
    });

    // Handle uncaught errors
    process.on('uncaughtException', (err) => {
      console.error('Uncaught exception:', err);
      if (!frontendProcess.killed) {
        frontendProcess.kill();
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start frontend development server:', error.message);
    process.exit(1);
  }
}

// Main execution
start().catch(error => {
  console.error('❌ Start failed:', error);
  process.exit(1);
});
