-- Preserve existing user management tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_demo BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL,
    priority VARCHAR(50),
    assigned_to INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP WITH TIME ZONE,
    is_demo BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    receiver_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_demo BOOLEAN DEFAULT false
);

-- New tables for IT service business
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_demo BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS service_tickets (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'open' 
        CHECK (status IN ('open', 'in_progress', 'completed', 'invoiced', 'cancelled')),
    priority VARCHAR(50) DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_demo BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL 
        CHECK (type IN ('income', 'expense', 'liability')),
    description TEXT,
    balance DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_demo BOOLEAN DEFAULT false
);

-- Enhanced invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    service_ticket_id INTEGER REFERENCES service_tickets(id),
    status VARCHAR(50) NOT NULL 
        CHECK (status IN ('draft', 'sent', 'paid', 'cancelled', 'overdue')),
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_demo BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL 
        CHECK (type IN ('service', 'product', 'labor')),
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_demo BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
    invoice_id INTEGER REFERENCES invoices(id),
    type VARCHAR(50) NOT NULL 
        CHECK (type IN ('income', 'expense')),
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_demo BOOLEAN DEFAULT false
);

-- Preserve existing labor tracking
CREATE TABLE IF NOT EXISTS labor_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    service_ticket_id INTEGER REFERENCES service_tickets(id),
    hours DECIMAL(10,2) NOT NULL,
    rate_per_hour DECIMAL(10,2) NOT NULL,
    description TEXT,
    work_date DATE NOT NULL,
    invoice_id INTEGER REFERENCES invoices(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_demo BOOLEAN DEFAULT false
);

-- Create view for monthly labor summary
CREATE OR REPLACE VIEW monthly_labor_summary AS
SELECT 
    DATE_TRUNC('month', work_date) as month,
    SUM(CASE WHEN invoice_id IS NULL THEN hours * rate_per_hour ELSE 0 END) as outstanding_labor,
    SUM(CASE 
        WHEN invoice_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM invoices i 
            WHERE i.id = labor_entries.invoice_id 
            AND i.status = 'paid'
        ) 
        THEN hours * rate_per_hour 
        ELSE 0 
    END) as paid_labor
FROM labor_entries
GROUP BY DATE_TRUNC('month', work_date)
ORDER BY month DESC;

-- Create view for client balance summary
CREATE OR REPLACE VIEW client_balance_summary AS
SELECT 
    c.id as client_id,
    c.name as client_name,
    COUNT(DISTINCT i.id) as total_invoices,
    SUM(CASE WHEN i.status = 'paid' THEN i.total_amount ELSE 0 END) as total_paid,
    SUM(CASE WHEN i.status IN ('sent', 'overdue') THEN i.total_amount ELSE 0 END) as total_outstanding,
    MAX(i.due_date) as latest_due_date
FROM clients c
LEFT JOIN invoices i ON c.id = i.client_id
GROUP BY c.id, c.name;
