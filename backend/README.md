# Backend Service with PostgreSQL

This backend service uses PostgreSQL for data storage, configured to work with the existing PostgreSQL Docker container.

## Prerequisites

- Node.js 16+ and npm
- Docker (PostgreSQL container running as `backend_db_1`)

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up the database and start the server:
```bash
npm run dev
```

This will:
- Connect to the PostgreSQL container
- Initialize the database schema and seed data
- Start the development server

## Database Configuration

The application uses the following environment variables for database connection (defined in `.env`):
```
PGUSER=postgres
PGHOST=localhost
PGDATABASE=dashboard
PGPASSWORD=postgres
PGPORT=5432
PORT=3001
```

## Available Commands

- `npm run setup` - Initialize/reset the database (creates tables and loads seed data)
- `npm run dev` - Start the development server (includes database setup)
- `npm run db:shell` - Open PostgreSQL shell connected to the database
- `npm run db:reset` - Reset the database (drops and recreates)
- `npm run db:logs` - View PostgreSQL container logs
- `npm run db:status` - Check PostgreSQL connection status

## Database Schema

The database includes tables for:
- Users and authentication
- Tasks and project management
- Client management
- Service tickets
- Invoicing and billing
- Labor tracking
- Financial transactions

See `db/schema.sql` for complete schema details.

## Working with the Database

### Accessing the Database

The application connects to the PostgreSQL container `backend_db_1`. You can:

1. Connect using psql inside the container:
```bash
npm run db:shell
```

2. View database logs:
```bash
npm run db:logs
```

3. Check connection status:
```bash
npm run db:status
```

### Database Reset

To completely reset the database (drops all tables and recreates):
```bash
npm run db:reset
```

This will:
1. Drop all existing tables
2. Recreate the schema
3. Load seed data

### Schema Changes

1. Update the schema in `db/schema.sql`
2. Update seed data in `db/seed.sql` if needed
3. Run `npm run db:reset` to apply changes

## Development Workflow

1. Make sure the PostgreSQL container `backend_db_1` is running
2. Run `npm run dev` to start development
3. The server will automatically set up the database if needed
4. API endpoints will be available at `http://localhost:3001`

## Troubleshooting

1. **Database Connection Issues**
   - Check if the PostgreSQL container is running:
     ```bash
     docker ps | grep backend_db_1
     ```
   - View PostgreSQL logs:
     ```bash
     npm run db:logs
     ```
   - Verify connection:
     ```bash
     npm run db:status
     ```

2. **Schema/Data Issues**
   - Reset the database:
     ```bash
     npm run db:reset
     ```
   - Check the database directly:
     ```bash
     npm run db:shell
     ```

3. **Container Issues**
   - Check container status:
     ```bash
     docker ps | grep backend_db_1
     ```
   - Restart container if needed:
     ```bash
     docker restart backend_db_1
     ```

## Post-Setup Verification

After setting up the database and starting the server, you can verify the setup by:

1. Access the API endpoints at http://localhost:3001
2. Connect to the database using:
   ```bash
   npm run db:shell
   ```
3. View database logs:
   ```bash
   npm run db:logs
   ```
4. Check database connection status:
   ```bash
   npm run db:status
   ```

## Additional Notes

- The database uses the existing PostgreSQL container (backend_db_1)
- All database operations are performed through Docker commands
- Schema changes require a database reset (npm run db:reset)
- The development server automatically sets up the database on startup
- API endpoints are available at http://localhost:3001 after startup
- Database logs can be monitored in real-time using npm run db:logs

## Production Deployment

For production deployment:
1. Ensure the PostgreSQL container is running
2. Set up environment variables
3. Run database setup:
   ```bash
   npm run setup
   ```
4. Start the production server:
   ```bash
   npm run start
   ```
