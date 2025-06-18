-- Adicionar campos do Stripe nas tabelas existentes
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255);

ALTER TABLE companies
ADD COLUMN IF NOT EXISTS stripe_account_status VARCHAR(50) DEFAULT 'pending';

ALTER TABLE companies
ADD COLUMN IF NOT EXISTS stripe_onboarding_url TEXT;

ALTER TABLE companies
ADD COLUMN IF NOT EXISTS stripe_dashboard_url TEXT;

-- Atualizar tabela de cobranças PIX para incluir dados do Stripe
ALTER TABLE pix_charges
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);

ALTER TABLE pix_charges
ADD COLUMN IF NOT EXISTS stripe_charge_id VARCHAR(255);

ALTER TABLE pix_charges
ADD COLUMN IF NOT EXISTS stripe_transfer_id VARCHAR(255);

ALTER TABLE pix_charges
ADD COLUMN IF NOT EXISTS stripe_fee_amount DECIMAL(10, 2);

ALTER TABLE pix_charges
ADD COLUMN IF NOT EXISTS net_amount DECIMAL(15, 2);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_companies_stripe_account ON companies (stripe_account_id);

CREATE INDEX IF NOT EXISTS idx_pix_charges_stripe_payment_intent ON pix_charges (stripe_payment_intent_id);

-- Função para calcular valores líquidos após taxas
CREATE OR REPLACE FUNCTION calculate_charge_amounts(
  p_gross_amount DECIMAL(15,2),
  p_fee_percentage DECIMAL(5,4) DEFAULT 0.0199
) RETURNS TABLE(
  gross_amount DECIMAL(15,2),
  fee_amount DECIMAL(15,2),
  net_amount DECIMAL(15,2)
) AS $$
BEGIN
  RETURN QUERY SELECT 
    p_gross_amount,
    ROUND(p_gross_amount * p_fee_percentage, 2),
    ROUND(p_gross_amount - (p_gross_amount * p_fee_percentage), 2);
END;
$$ LANGUAGE plpgsql;