#!/usr/bin/env node

import { execSync } from 'child_process';
import type { ExecSyncOptions } from 'child_process';

interface Colors {
  reset: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
}

const colors: Colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function execCommand(command: string, options: ExecSyncOptions = {}): boolean {
  try {
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    return false;
  }
}

function cleanup(): void {
  console.log(`${colors.blue}Cleaning up existing containers and processes...${colors.reset}`);
  
  // Stop and remove existing containers
  execCommand('docker-compose down');
  
  // Remove orphaned containers
  execCommand('docker container prune -f');
  
  // Kill processes on ports if they exist
  const ports = [3000, 3001, 5432];
  ports.forEach(port => {
    try {
      const processes = execSync(`lsof -i :${port} -t`).toString().trim();
      if (processes) {
        processes.split('\n').forEach(pid => {
          execCommand(`kill -9 ${pid}`);
        });
        console.log(`${colors.green}Killed process on port ${port}${colors.reset}`);
      }
    } catch (error) {
      // No process found on port
    }
  });
}

function waitForPostgres(): Promise<boolean> {
  return new Promise((resolve) => {
    console.log(`${colors.blue}Waiting for Postgres to be ready...${colors.reset}`);
    let attempts = 0;
    const maxAttempts = 30; // 30 * 2 seconds = 60 seconds max wait time
    
    const interval = setInterval(() => {
      attempts++;
      try {
        execSync('docker exec dashboard-postgres pg_isready -U postgres');
        clearInterval(interval);
        console.log(`${colors.green}Postgres is ready!${colors.reset}`);
        resolve(true);
      } catch (error) {
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          console.error(`${colors.red}Postgres failed to become ready${colors.reset}`);
          resolve(false);
        }
      }
    }, 2000);
  });
}

async function setupDatabase(): Promise<boolean> {
  console.log(`${colors.blue}Setting up database...${colors.reset}`);
  return execCommand('node backend/scripts/setup-db.js');
}

async function startStack(): Promise<void> {
  console.log(`${colors.blue}Starting Docker stack...${colors.reset}`);
  
  // Start containers in detached mode
  if (!execCommand('docker-compose up --build -d')) {
    console.error(`${colors.red}Failed to start Docker stack${colors.reset}`);
    process.exit(1);
  }

  // Wait for Postgres to be ready
  if (!await waitForPostgres()) {
    console.error(`${colors.red}Database failed to initialize${colors.reset}`);
    cleanup();
    process.exit(1);
  }

  // Setup database
  if (!await setupDatabase()) {
    console.error(`${colors.red}Database setup failed${colors.reset}`);
    cleanup();
    process.exit(1);
  }

  // Attach to logs
  execCommand('docker-compose logs -f');
}

// Main execution
cleanup();
void startStack();
