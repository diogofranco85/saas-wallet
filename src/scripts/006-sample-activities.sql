-- Script opcional para criar algumas atividades de exemplo
-- (Execute apenas se quiser dados de teste)

-- Função para criar atividades de exemplo
CREATE OR REPLACE FUNCTION create_sample_activities() RETURNS VOID AS $$
DECLARE
  v_company_id UUID;
  v_owner_id UUID;
  v_admin_id UUID;
  v_employee_id UUID;
BEGIN
  -- Pegar uma empresa existente (primeira encontrada)
  SELECT id INTO v_company_id FROM companies LIMIT 1;
  
  IF v_company_id IS NOT NULL THEN
    -- Pegar usuários da empresa
    SELECT id INTO v_owner_id FROM users WHERE company_id = v_company_id AND role = 'owner' LIMIT 1;
    SELECT id INTO v_admin_id FROM users WHERE company_id = v_company_id AND role = 'admin' LIMIT 1;
    SELECT id INTO v_employee_id FROM users WHERE company_id = v_company_id AND role = 'employee' LIMIT 1;
    
    -- Criar algumas atividades de exemplo
    IF v_owner_id IS NOT NULL THEN
      PERFORM log_team_activity(
        v_company_id,
        v_owner_id,
        v_admin_id,
        'member_added',
        'Novo administrador adicionado à equipe',
        jsonb_build_object('role', 'admin')
      );
      
      PERFORM log_team_activity(
        v_company_id,
        v_owner_id,
        v_employee_id,
        'invitation_sent',
        'Convite enviado para novo funcionário',
        jsonb_build_object('email', 'funcionario@exemplo.com', 'role', 'employee')
      );
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Executar apenas se quiser dados de exemplo
-- SELECT create_sample_activities();

-- Remover a função após uso
-- DROP FUNCTION create_sample_activities();