-- Criar tabela de perfis (se não existir)
-- Na verdade, vamos usar a tabela users existente como perfil
-- Mas vamos adicionar campos que podem estar faltando

-- Adicionar campos que podem estar faltando na tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo';

ALTER TABLE users
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'pt-BR';

ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Atualizar a função de log de atividades para usar a tabela users correta
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

-- Atualizar trigger para usar a tabela users
CREATE OR REPLACE FUNCTION trigger_log_role_change()
RETURNS TRIGGER AS $$
DECLARE
  v_current_user_id UUID;
BEGIN
  -- Só registra se o role mudou
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Tentar pegar o usuário atual do contexto (se disponível)
    -- Por enquanto, vamos usar o próprio usuário como quem fez a mudança
    v_current_user_id := NEW.id;
    
    PERFORM log_team_activity(
      NEW.company_id,
      v_current_user_id,
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

-- Recriar o trigger
DROP TRIGGER IF EXISTS trigger_user_role_change ON users;

CREATE TRIGGER trigger_user_role_change
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_log_role_change();

-- Índices adicionais para performance
CREATE INDEX IF NOT EXISTS idx_users_company_role ON users (company_id, role);

CREATE INDEX IF NOT EXISTS idx_users_email_company ON users (email, company_id);

CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);