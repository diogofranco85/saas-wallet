CREATE TABLE IF NOT EXISTS pix_charges_history (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    pix_charge_id UUID REFERENCES pix_charges (id),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'created', 'paid', 'cancelled'
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION trigger_pix_charges_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Só registra se o role mudou
  IF OLD.status IS DISTINCT FROM NEW.status THEN
   
    INSERT INTO pix_charges_history (
    pix_charge_id,
    status
  ) VALUES (
    NEW.id,
    NEW.status
  );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;