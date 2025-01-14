# Dashboard Application Architecture

A modern full-stack dashboard application with React frontend and Node.js backend.

## Architecture Overview

### 1. Frontend Architecture

- Modern React application built with Vite and TypeScript
- Uses ShadCN for UI components and styling
- Feature-based organization under `src/features/`
- Organized routes using file-based routing (`_authenticated`, `auth`)
- Communicates with backend via REST API (configured in `api.ts`)
- Development server runs on default Vite port
- Production deployment configured via Netlify

### 2. Backend Architecture

- Node.js server running on port 3001
- PostgreSQL database for data storage
- Comprehensive schema supporting:
  * User management
  * Task tracking
  * Client management
  * Service tickets
  * Invoicing and billing
  * Labor tracking
  * Financial transactions
- Includes views for business analytics:
  * Monthly labor summary
  * Client balance summary

### 3. Docker Integration

- Docker is used specifically for the database layer
- PostgreSQL runs in a container named 'backend_db_1'
- Database configuration managed through environment variables
- Development workflow relies on Docker for consistent database environment
- Container provides isolation and portability for the database

### 4. Frontend-Backend Relationship

- Decoupled architecture with clear separation of concerns
- Frontend connects to backend API:
  * Development: http://localhost:3002
  * Production: https://api.dashboard.esit.app
- Backend serves as RESTful API layer between frontend and database
- Database schema supports all frontend features (tasks, users, invoices, etc.)
- Demo mode supported across all entities (is_demo flag in tables)

### 5. Development Workflow

- Database initialization and seeding handled by setup scripts
- Development environment uses local Docker container
- Automated scripts for database management (reset, shell access, logs)
- Hot reload supported for frontend development
- Backend includes utilities for process management (kill-port.js)

## Prerequisites

- Node.js 20 LTS or higher (recommended for improved performance and features)
- Docker for database container
- npm or pnpm package manager

## Node.js Setup

1. Install nvm (Node Version Manager) if not already installed:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

2. Restart your terminal or run:
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

3. Install and use Node.js 20 LTS:
```bash
nvm install 20 --lts    # Install Node.js 20 LTS
nvm use 20             # Switch to Node.js 20
nvm alias default 20   # Make Node.js 20 the default version
node --version         # Verify version (should show v20.x.x)
```

## Getting Started

1. Start the database container:
```bash
docker start backend_db_1
```

2. Install frontend dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Development Guidelines

- Frontend changes will hot reload automatically
- Database changes require running setup scripts
- Use feature-based organization for new components
- Follow ShadCN component patterns for UI consistency
- Use provided skeleton patterns for loading states:
  * ChartSkeleton for chart components
  * TableSkeleton for data tables
  * CardSkeleton for card layouts
  * ListItemSkeleton for list items
- Ensure demo mode compatibility for new features

## Port Configuration

The application uses environment variables for port configuration:
- Backend port is configured in `backend/.env` (default: 3001)
- Frontend uses Vite's default port (5173)
- Development scripts automatically handle port cleanup
- Use `kill-port.js [port]` to manually clean up specific ports

## Production Deployment

- Frontend deploys via Netlify
- Backend API serves from api.dashboard.esit.app
- Database runs in production Docker environment
- Environment variables manage configuration

This architecture follows modern best practices with clear separation of concerns, containerized database, and scalable structure suitable for both development and production environments.
