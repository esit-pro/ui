#!/usr/bin/env node
import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  console.log('🚀 Setting up database...');

  try {
    // Test database connection
    console.log('Testing database connection...');
    try {
      execSync('docker exec dashboard-postgres psql -U postgres -d dashboard -c "SELECT 1"');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      console.log('Please check your database credentials in .env');
      process.exit(1);
    }

    // Read schema and seed files
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    const seedPath = path.join(__dirname, '..', 'db', 'seed.sql');
    
    console.log('Reading schema and seed files...');
    const schema = await fs.readFile(schemaPath, 'utf8');
    const seed = await fs.readFile(seedPath, 'utf8');

    // Execute schema
    console.log('Applying database schema...');
    execSync(`docker exec -i dashboard-postgres psql -U postgres -d dashboard -c "${schema}"`, {
      stdio: 'inherit'
    });

    // Execute seed data
    console.log('Seeding database...');
    execSync(`docker exec -i dashboard-postgres psql -U postgres -d dashboard -c "${seed}"`, {
      stdio: 'inherit'
    });

    console.log('✅ Database setup complete');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
