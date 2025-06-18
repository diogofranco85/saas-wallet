-- Inserir planos padrão
INSERT INTO
    plans (
        name,
        description,
        price,
        features,
        pix_fee_percentage,
        max_employees
    )
VALUES (
        'Free',
        'Plano gratuito',
        0.0,
        '{"max_charges_month": 30, "support": "email"}',
        0.0359,
        3
    ),
    (
        'Starter',
        'Plano básico para pequenas empresas',
        29.90,
        '{"max_charges_month": 100, "support": "email"}',
        0.0299,
        3
    ),
    (
        'Professional',
        'Plano para empresas em crescimento',
        79.90,
        '{"max_charges_month": 500, "support": "priority", "custom_branding": true}',
        0.0249,
        10
    ),
    (
        'Enterprise',
        'Plano para grandes empresas',
        199.90,
        '{"max_charges_month": -1, "support": "dedicated", "custom_branding": true, "api_access": true}',
        0.0199,
        50
    );