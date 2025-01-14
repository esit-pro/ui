import express from 'express';
import pkg from 'pg';
import dotenv from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { Pool } = pkg;

dotenv.config();

const app = express();
app.set('trust proxy', true);

// CORS configuration for development
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());
const port = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.DOCKER_CONTAINER ? process.env.PGHOST : 'localhost',
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

console.log('Database connection config:', {
  user: process.env.PGUSER,
  host: process.env.DOCKER_CONTAINER ? process.env.PGHOST : 'localhost',
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
});

// Initialize database with schema and seed data
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    const schemaPath = path.join(__dirname, 'db', 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    await client.query(schema);
    
    const seedPath = path.join(__dirname, 'db', 'seed.sql');
    const seed = await fs.readFile(seedPath, 'utf8');
    await client.query(seed);
    
    console.log('Database initialized with schema and seed data');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    client.release();
  }
}

// Initialize database on server start
initializeDatabase();

// API Routes (no authentication required for now)
app.get('/api/profit-loss', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      WITH monthly_totals AS (
        SELECT 
          DATE_TRUNC('month', t.transaction_date) as month,
          SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) as income,
          SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as expenses
        FROM transactions t
        WHERE t.is_demo = true
        GROUP BY DATE_TRUNC('month', t.transaction_date)
        ORDER BY month DESC
        LIMIT 6
      )
      SELECT 
        to_char(month, 'Mon YYYY') as month_label,
        to_char(month, 'YYYY-MM-DD') as month_date,
        income,
        expenses,
        (income - expenses) as profit
      FROM monthly_totals
      ORDER BY month_date ASC;
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching profit-loss data:', error);
    res.status(500).json({ error: 'Failed to fetch profit-loss data' });
  } finally {
    client.release();
  }
});

app.get('/api/labor/monthly-summary', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        to_char(month, 'Mon YYYY') as month_label,
        to_char(month, 'YYYY-MM-DD') as month_date,
        outstanding_labor,
        paid_labor
      FROM monthly_labor_summary
      ORDER BY month_date ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching monthly labor summary:', error);
    res.status(500).json({ error: 'Failed to fetch monthly labor summary' });
  } finally {
    client.release();
  }
});

app.get('/api/tasks', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  } finally {
    client.release();
  }
});

// Health check endpoint
app.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    res.send(`Database connection successful. Current time: ${result.rows[0].now}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error connecting to the database');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
});
