-- Função para atualizar saldo da carteira quando uma cobrança é paga
CREATE OR REPLACE FUNCTION update_wallet_balance(
  p_company_id UUID,
  p_amount DECIMAL(15,2),
  p_charge_id UUID
) RETURNS VOID AS $$
DECLARE
  v_fee_amount DECIMAL(15,2);
  v_net_amount DECIMAL(15,2);
BEGIN
  -- Calcular taxa (exemplo: 1.99%)
  v_fee_amount := p_amount * 0.0199;
  v_net_amount := p_amount - v_fee_amount;
  
  -- Atualizar saldo da carteira
  UPDATE wallets 
  SET 
    balance = balance + v_net_amount,
    available_balance = available_balance + v_net_amount,
    updated_at = NOW()
  WHERE company_id = p_company_id;
  
  -- Criar transação de crédito
  INSERT INTO transactions (
    company_id,
    wallet_id,
    charge_id,
    type,
    amount,
    description,
    status
  ) VALUES (
    p_company_id,
    (SELECT id FROM wallets WHERE company_id = p_company_id),
    p_charge_id,
    'credit',
    v_net_amount,
    'Pagamento PIX recebido',
    'completed'
  );
  
  -- Criar transação de taxa
  INSERT INTO transactions (
    company_id,
    wallet_id,
    charge_id,
    type,
    amount,
    description,
    status
  ) VALUES (
    p_company_id,
    (SELECT id FROM wallets WHERE company_id = p_company_id),
    p_charge_id,
    'fee',
    v_fee_amount,
    'Taxa de processamento PIX',
    'completed'
  );
END;
$$ LANGUAGE plpgsql;