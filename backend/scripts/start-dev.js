#!/usr/bin/env node
import { execSync } from 'child_process';
import { setTimeout } from 'timers/promises';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  try {
    console.log('Initializing database with schema and seed data...');
    
    // Read schema and seed files
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    const seedPath = path.join(__dirname, '..', 'db', 'seed.sql');
    
    const schema = await fs.readFile(schemaPath, 'utf8');
    const seed = await fs.readFile(seedPath, 'utf8');
    
    // Execute schema and seed using psql
    execSync(`docker exec -i dashboard-postgres psql -U postgres -d dashboard -c "${schema.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
    execSync(`docker exec -i dashboard-postgres psql -U postgres -d dashboard -c "${seed.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting development environment...');

  // Check if Docker is running
  try {
    console.log('Checking Docker status...');
    execSync('docker info', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Docker is not running. Please start Docker first.');
    process.exit(1);
  }

  // Check if PostgreSQL container exists and is running
  try {
    console.log('Checking PostgreSQL container...');
    const containerId = execSync('docker ps -q -f name=dashboard-postgres').toString().trim();
    
    if (!containerId) {
      console.log('PostgreSQL container not running, checking if it exists...');
      const existingId = execSync('docker ps -aq -f name=dashboard-postgres').toString().trim();
      
      if (existingId) {
        console.log('Starting existing PostgreSQL container...');
        execSync(`docker start ${existingId}`, { stdio: 'inherit' });
      } else {
        console.log('Creating new PostgreSQL container...');
        // Create container with proper command formatting
        execSync('docker run -d --name dashboard-postgres -e POSTGRES_DB=dashboard -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15', { 
          stdio: 'inherit'
        });

        // Wait for PostgreSQL to be ready
        console.log('Waiting for PostgreSQL to be ready...');
        let attempts = 0;
        while (attempts < 30) {
          try {
            execSync('docker exec dashboard-postgres pg_isready');
            console.log('✅ PostgreSQL is ready');
            break;
          } catch (e) {
            attempts++;
            if (attempts === 30) {
              throw new Error('PostgreSQL failed to start after 30 seconds');
            }
            await setTimeout(1000);
          }
        }

        // Initialize database with schema and seed data
        await initializeDatabase();
      }
    } else {
      console.log('✅ PostgreSQL container is already running');
    }

    // Start the backend server
    console.log('Starting backend server...');
    execSync('node server.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

  } catch (error) {
    console.error('❌ Failed to start development environment:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Startup failed:', error);
  process.exit(1);
});
