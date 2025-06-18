-- Criar tabelas principais
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    document VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address JSONB,
    plan_id UUID,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    google_id VARCHAR(255) UNIQUE,
    company_id UUID REFERENCES companies (id),
    role VARCHAR(20) DEFAULT 'employee', -- 'admin', 'owner', 'employee'
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallets (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    company_id UUID REFERENCES companies (id) UNIQUE,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    available_balance DECIMAL(15, 2) DEFAULT 0.00,
    pending_balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plans (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    features JSONB,
    pix_fee_percentage DECIMAL(5, 4) DEFAULT 0.0199, -- 1.99%
    pix_fee_fixed DECIMAL(10, 2) DEFAULT 0.00,
    max_employees INTEGER DEFAULT 5,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pix_charges (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    company_id UUID REFERENCES companies (id),
    created_by UUID REFERENCES users (id),
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    payer_name VARCHAR(255),
    payer_document VARCHAR(20),
    payer_email VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'expired', 'cancelled'
    pix_key TEXT,
    qr_code TEXT,
    stripe_payment_intent_id VARCHAR(255),
    expires_at TIMESTAMP,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    company_id UUID REFERENCES companies (id),
    wallet_id UUID REFERENCES wallets (id),
    charge_id UUID REFERENCES pix_charges (id),
    type VARCHAR(20) NOT NULL, -- 'credit', 'debit', 'fee'
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invitations (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    company_id UUID REFERENCES companies (id),
    invited_by UUID REFERENCES users (id),
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'employee',
    token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'expired'
    expires_at TIMESTAMP DEFAULT(NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP DEFAULT NOW()
);