-- Clear existing data
TRUNCATE users, tasks, chats, clients, service_tickets, accounts, invoices, invoice_items, transactions, labor_entries CASCADE;

-- Reset sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE clients_id_seq RESTART WITH 1;
ALTER SEQUENCE service_tickets_id_seq RESTART WITH 1;
ALTER SEQUENCE accounts_id_seq RESTART WITH 1;
ALTER SEQUENCE invoices_id_seq RESTART WITH 1;
ALTER SEQUENCE invoice_items_id_seq RESTART WITH 1;
ALTER SEQUENCE transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE labor_entries_id_seq RESTART WITH 1;

-- Insert demo users (IT staff)
INSERT INTO users (name, email, role, is_demo) VALUES
('John Tech', 'john@techservice.com', 'technician', true),
('Sarah Admin', 'sarah@techservice.com', 'admin', true),
('Mike Support', 'mike@techservice.com', 'support', true);

-- Insert demo clients
INSERT INTO clients (name, email, phone, address, is_demo) VALUES
('Acme Corp', 'contact@acme.com', '555-0100', '123 Business Ave, Suite 100', true),
('TechStart Inc', 'it@techstart.com', '555-0200', '456 Startup Lane', true),
('Global Services LLC', 'support@globalservices.com', '555-0300', '789 Enterprise Blvd', true);

-- Insert accounts for clients
INSERT INTO accounts (client_id, name, type, description, balance, is_demo) VALUES
(1, 'Acme Service Account', 'income', 'Main service account for Acme Corp', 0.00, true),
(1, 'Acme Hardware Account', 'expense', 'Hardware purchases for Acme Corp', 0.00, true),
(2, 'TechStart Service Account', 'income', 'Main service account for TechStart', 0.00, true),
(3, 'Global Services Account', 'income', 'Main service account for Global Services', 0.00, true);

-- Insert service tickets
INSERT INTO service_tickets (client_id, title, description, status, priority, assigned_to, is_demo) VALUES
(1, 'Network Setup', 'Setup new office network infrastructure', 'completed', 'high', 1, true),
(1, 'Server Maintenance', 'Monthly server maintenance and updates', 'in_progress', 'medium', 1, true),
(2, 'Email Configuration', 'Configure Microsoft 365 email services', 'invoiced', 'high', 3, true),
(3, 'Security Audit', 'Perform quarterly security audit', 'open', 'high', 2, true);

-- Insert invoices
INSERT INTO invoices (
    client_id, service_ticket_id, status, subtotal, tax_rate, tax_amount, 
    total_amount, issue_date, due_date, paid_date, notes, is_demo
) VALUES
(1, 1, 'paid', 2500.00, 0.10, 250.00, 2750.00, '2024-01-15', '2024-02-15', '2024-02-10', 'Network setup project completed', true),
(1, 2, 'draft', 500.00, 0.10, 50.00, 550.00, '2024-02-01', '2024-03-01', NULL, 'Monthly maintenance', true),
(2, 3, 'sent', 1200.00, 0.10, 120.00, 1320.00, '2024-02-01', '2024-03-01', NULL, 'Email setup and configuration', true),
(3, NULL, 'overdue', 800.00, 0.10, 80.00, 880.00, '2024-01-01', '2024-02-01', NULL, 'Previous security consultation', true);

-- Insert invoice items
INSERT INTO invoice_items (invoice_id, type, description, quantity, unit_price, amount, is_demo) VALUES
-- Network Setup Invoice Items
(1, 'product', 'Network Switch - 48 Port', 1, 800.00, 800.00, true),
(1, 'product', 'CAT6 Cable (1000ft)', 2, 200.00, 400.00, true),
(1, 'service', 'Network Configuration', 8, 125.00, 1000.00, true),
(1, 'labor', 'Cable Installation', 4, 75.00, 300.00, true),
-- Server Maintenance Invoice Items
(2, 'service', 'Server Updates and Maintenance', 4, 125.00, 500.00, true),
-- Email Configuration Invoice Items
(3, 'service', 'Microsoft 365 Setup', 4, 125.00, 500.00, true),
(3, 'product', 'Microsoft 365 Business Premium (Annual)', 10, 70.00, 700.00, true),
-- Security Audit Invoice Items
(4, 'service', 'Security Assessment', 4, 150.00, 600.00, true),
(4, 'service', 'Vulnerability Scanning', 2, 100.00, 200.00, true);

-- Insert labor entries
INSERT INTO labor_entries (user_id, service_ticket_id, hours, rate_per_hour, description, work_date, invoice_id, is_demo) VALUES
(1, 1, 8.0, 125.00, 'Network infrastructure setup and configuration', '2024-01-15', 1, true),
(1, 1, 4.0, 75.00, 'Cable installation and testing', '2024-01-16', 1, true),
(1, 2, 4.0, 125.00, 'Server maintenance and updates', '2024-02-01', 2, true),
(3, 3, 4.0, 125.00, 'Email system configuration', '2024-02-01', 3, true);

-- Insert transactions
INSERT INTO transactions (account_id, invoice_id, type, amount, description, transaction_date, is_demo) VALUES
(1, 1, 'income', 2750.00, 'Payment for network setup project', '2024-02-10', true),
(2, 1, 'expense', 1200.00, 'Network equipment purchase', '2024-01-15', true),
(3, 3, 'income', 1320.00, 'Email configuration services', '2024-02-01', true);

-- Insert some tasks
INSERT INTO tasks (title, description, status, priority, assigned_to, due_date, is_demo) VALUES
('Weekly Backup Check', 'Verify all client backups are running successfully', 'in_progress', 'high', 1, '2024-02-15', true),
('License Renewal', 'Renew software licenses for Acme Corp', 'open', 'medium', 2, '2024-03-01', true),
('Security Update', 'Apply security patches to all client servers', 'open', 'high', 1, '2024-02-20', true);
