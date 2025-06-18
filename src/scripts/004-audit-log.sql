-- Criar tabela de auditoria para atividades da equipe
CREATE TABLE IF NOT EXISTS team_activity_log (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    company_id UUID REFERENCES companies (id) NOT NULL,
    user_id UUID REFERENCES users (id), -- Quem fez a ação
    target_user_id UUID REFERENCES users (id), -- Em quem foi feita a ação
    action_type VARCHAR(50) NOT NULL, -- 'member_added', 'member_removed', 'role_changed', 'invitation_sent', etc.
    description TEXT NOT NULL,
    metadata JSONB, -- Dados adicionais como old_role, new_role, etc.
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_team_activity_company_id ON team_activity_log (company_id);

CREATE INDEX IF NOT EXISTS idx_team_activity_created_at ON team_activity_log (created_at);

-- Função para registrar atividade da equipe
CREATE OR REPLACE FUNCTION log_team_activity(
  p_company_id UUID,
  p_user_id UUID,
  p_target_user_id UUID,
  p_action_type VARCHAR(50),
  p_description TEXT,
  p_metadata JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO team_activity_log (
    company_id,
    user_id,
    target_user_id,
    action_type,
    description,
    metadata
  ) VALUES (
    p_company_id,
    p_user_id,
    p_target_user_id,
    p_action_type,
    p_description,
    p_metadata
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar mudanças de role automaticamente
CREATE OR REPLACE FUNCTION trigger_log_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Só registra se o role mudou
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    PERFORM log_team_activity(
      NEW.company_id,
      NEW.id, -- Por enquanto, assume que o usuário mudou seu próprio role
      NEW.id,
      'role_changed',
      'Função alterada de ' || COALESCE(OLD.role, 'N/A') || ' para ' || NEW.role,
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_user_role_change ON users;

CREATE TRIGGER trigger_user_role_change
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_log_role_change();