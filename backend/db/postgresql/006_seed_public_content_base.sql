WITH locales(locale, prefix) AS (
    VALUES
        ('es-ES', ''),
        ('ca-ES', '[CA] '),
        ('eu-ES', '[EU] '),
        ('gl-ES', '[GL] '),
        ('va-ES', '[VA] ')
), legislation_data(kind, value_type, sort_order, title, body, external_url) AS (
    VALUES
        ('LEGISLATION', 'law', 0, 'Marco de procedimiento administrativo', 'Normativa base de tramitacion electronica municipal.', 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565'),
        ('LEGISLATION', 'decree', 1, 'Esquema Nacional de Seguridad', 'Aplicacion del ENS en servicios digitales del ayuntamiento.', 'https://www.boe.es/buscar/act.php?id=BOE-A-2022-7191'),
        ('LEGISLATION', 'order', 2, 'Orden de gestion documental', 'Criterios internos de archivo y conservacion documental.', NULL),
        ('LEGISLATION', 'resolution', 3, 'Resolucion de accesibilidad', 'Compromiso institucional con WCAG y mejora continua.', NULL)
)
INSERT INTO public_content_entries (
    id, entry_kind, locale, value_type, title_text, body_text, external_url,
    sort_order, published, created_at, updated_at
)
SELECT
    (
        substr(md5(d.kind || '|' || l.locale || '|' || d.value_type), 1, 8) || '-' ||
        substr(md5(d.kind || '|' || l.locale || '|' || d.value_type), 9, 4) || '-' ||
        substr(md5(d.kind || '|' || l.locale || '|' || d.value_type), 13, 4) || '-' ||
        substr(md5(d.kind || '|' || l.locale || '|' || d.value_type), 17, 4) || '-' ||
        substr(md5(d.kind || '|' || l.locale || '|' || d.value_type), 21, 12)
    )::uuid,
    d.kind,
    l.locale,
    d.value_type,
    l.prefix || d.title,
    l.prefix || d.body,
    d.external_url,
    d.sort_order,
    true,
    NOW(),
    NOW()
FROM locales l
CROSS JOIN legislation_data d
WHERE NOT EXISTS (
    SELECT 1
    FROM public_content_entries e
    WHERE e.entry_kind = d.kind
      AND e.locale = l.locale
      AND e.value_type = d.value_type
);

WITH locales(locale, prefix) AS (
    VALUES
        ('es-ES', ''),
        ('ca-ES', '[CA] '),
        ('eu-ES', '[EU] '),
        ('gl-ES', '[GL] '),
        ('va-ES', '[VA] ')
), faq_categories(kind, category_code, sort_order, title) AS (
    VALUES
        ('FAQ_CATEGORY', 'general', 0, 'General'),
        ('FAQ_CATEGORY', 'procedures', 1, 'Procedimientos'),
        ('FAQ_CATEGORY', 'certificate', 2, 'Identidad digital'),
        ('FAQ_CATEGORY', 'payments', 3, 'Pagos')
)
INSERT INTO public_content_entries (
    id, entry_kind, locale, category_code, title_text, body_text,
    sort_order, published, created_at, updated_at
)
SELECT
    (
        substr(md5(c.kind || '|' || l.locale || '|' || c.category_code), 1, 8) || '-' ||
        substr(md5(c.kind || '|' || l.locale || '|' || c.category_code), 9, 4) || '-' ||
        substr(md5(c.kind || '|' || l.locale || '|' || c.category_code), 13, 4) || '-' ||
        substr(md5(c.kind || '|' || l.locale || '|' || c.category_code), 17, 4) || '-' ||
        substr(md5(c.kind || '|' || l.locale || '|' || c.category_code), 21, 12)
    )::uuid,
    c.kind,
    l.locale,
    c.category_code,
    l.prefix || c.title,
    '',
    c.sort_order,
    true,
    NOW(),
    NOW()
FROM locales l
CROSS JOIN faq_categories c
WHERE NOT EXISTS (
    SELECT 1
    FROM public_content_entries e
    WHERE e.entry_kind = c.kind
      AND e.locale = l.locale
      AND e.category_code = c.category_code
);

WITH locales(locale, prefix) AS (
    VALUES
        ('es-ES', ''),
        ('ca-ES', '[CA] '),
        ('eu-ES', '[EU] '),
        ('gl-ES', '[GL] '),
        ('va-ES', '[VA] ')
), faq_entries(kind, category_code, sort_order, question, answer) AS (
    VALUES
        ('FAQ', 'general', 0, 'Que es la sede electronica?', 'Es el canal oficial para tramites, consultas y notificaciones digitales.'),
        ('FAQ', 'procedures', 1, 'Como inicio un tramite?', 'Seleccione el procedimiento y complete el formulario guiado por pasos.'),
        ('FAQ', 'certificate', 2, 'Necesito certificado digital?', 'Algunos tramites requieren certificado o sistema equivalente de identificacion.'),
        ('FAQ', 'payments', 3, 'Como obtengo justificante de pago?', 'Al finalizar el pago puede descargar el recibo desde su expediente.')
)
INSERT INTO public_content_entries (
    id, entry_kind, locale, category_code, title_text, body_text,
    sort_order, published, created_at, updated_at
)
SELECT
    (
        substr(md5(f.kind || '|' || l.locale || '|' || f.category_code || '|' || f.sort_order), 1, 8) || '-' ||
        substr(md5(f.kind || '|' || l.locale || '|' || f.category_code || '|' || f.sort_order), 9, 4) || '-' ||
        substr(md5(f.kind || '|' || l.locale || '|' || f.category_code || '|' || f.sort_order), 13, 4) || '-' ||
        substr(md5(f.kind || '|' || l.locale || '|' || f.category_code || '|' || f.sort_order), 17, 4) || '-' ||
        substr(md5(f.kind || '|' || l.locale || '|' || f.category_code || '|' || f.sort_order), 21, 12)
    )::uuid,
    f.kind,
    l.locale,
    f.category_code,
    l.prefix || f.question,
    l.prefix || f.answer,
    f.sort_order,
    true,
    NOW(),
    NOW()
FROM locales l
CROSS JOIN faq_entries f
WHERE NOT EXISTS (
    SELECT 1
    FROM public_content_entries e
    WHERE e.entry_kind = f.kind
      AND e.locale = l.locale
      AND e.category_code = f.category_code
      AND e.sort_order = f.sort_order
);

WITH locales(locale, prefix) AS (
    VALUES
        ('es-ES', ''),
        ('ca-ES', '[CA] '),
        ('eu-ES', '[EU] '),
        ('gl-ES', '[GL] '),
        ('va-ES', '[VA] ')
), calendar_entries(kind, value_type, sort_order, title, body, event_date, related_procedure) AS (
    VALUES
        ('CALENDAR', 'deadline', 0, 'Fin de plazo de tasas', 'Fecha limite para tramites con liquidacion de tasas.', CURRENT_DATE + INTERVAL '15 days', 'tax-payment'),
        ('CALENDAR', 'holiday', 1, 'Festivo local', 'Dia no habil para atencion administrativa presencial.', CURRENT_DATE + INTERVAL '22 days', NULL),
        ('CALENDAR', 'info', 2, 'Sesion informativa digital', 'Jornada abierta para resolver dudas sobre tramitacion.', CURRENT_DATE + INTERVAL '10 days', NULL),
        ('CALENDAR', 'reminder', 3, 'Recordatorio de subsanacion', 'Revise expedientes en subsanacion para evitar caducidad.', CURRENT_DATE + INTERVAL '7 days', NULL)
)
INSERT INTO public_content_entries (
    id, entry_kind, locale, value_type, title_text, body_text, event_date, related_procedure,
    sort_order, published, created_at, updated_at
)
SELECT
    (
        substr(md5(c.kind || '|' || l.locale || '|' || c.value_type), 1, 8) || '-' ||
        substr(md5(c.kind || '|' || l.locale || '|' || c.value_type), 9, 4) || '-' ||
        substr(md5(c.kind || '|' || l.locale || '|' || c.value_type), 13, 4) || '-' ||
        substr(md5(c.kind || '|' || l.locale || '|' || c.value_type), 17, 4) || '-' ||
        substr(md5(c.kind || '|' || l.locale || '|' || c.value_type), 21, 12)
    )::uuid,
    c.kind,
    l.locale,
    c.value_type,
    l.prefix || c.title,
    l.prefix || c.body,
    c.event_date::date,
    c.related_procedure,
    c.sort_order,
    true,
    NOW(),
    NOW()
FROM locales l
CROSS JOIN calendar_entries c
WHERE NOT EXISTS (
    SELECT 1
    FROM public_content_entries e
    WHERE e.entry_kind = c.kind
      AND e.locale = l.locale
      AND e.value_type = c.value_type
);

WITH locales(locale, prefix) AS (
    VALUES
        ('es-ES', ''),
        ('ca-ES', '[CA] '),
        ('eu-ES', '[EU] '),
        ('gl-ES', '[GL] '),
        ('va-ES', '[VA] ')
), institutional_entries(kind, section_code, icon, sort_order, title, body) AS (
    VALUES
        ('INSTITUTIONAL', 'mission', 'target', 0, 'Mision institucional', 'Garantizar una tramitacion digital segura, accesible y orientada al ciudadano.'),
        ('INSTITUTIONAL', 'structure', 'building', 1, 'Estructura organizativa', 'Unidades de atencion, tramitacion y soporte coordinadas por sede electronica.')
)
INSERT INTO public_content_entries (
    id, entry_kind, locale, category_code, value_type, title_text, body_text,
    sort_order, published, created_at, updated_at
)
SELECT
    (
        substr(md5(i.kind || '|' || l.locale || '|' || i.section_code), 1, 8) || '-' ||
        substr(md5(i.kind || '|' || l.locale || '|' || i.section_code), 9, 4) || '-' ||
        substr(md5(i.kind || '|' || l.locale || '|' || i.section_code), 13, 4) || '-' ||
        substr(md5(i.kind || '|' || l.locale || '|' || i.section_code), 17, 4) || '-' ||
        substr(md5(i.kind || '|' || l.locale || '|' || i.section_code), 21, 12)
    )::uuid,
    i.kind,
    l.locale,
    i.section_code,
    i.icon,
    l.prefix || i.title,
    l.prefix || i.body,
    i.sort_order,
    true,
    NOW(),
    NOW()
FROM locales l
CROSS JOIN institutional_entries i
WHERE NOT EXISTS (
    SELECT 1
    FROM public_content_entries e
    WHERE e.entry_kind = i.kind
      AND e.locale = l.locale
      AND e.category_code = i.section_code
);

WITH locales(locale, prefix) AS (
    VALUES
        ('es-ES', ''),
        ('ca-ES', '[CA] '),
        ('eu-ES', '[EU] '),
        ('gl-ES', '[GL] '),
        ('va-ES', '[VA] ')
), organism_entries(kind, category_code, sort_order, address, name, description, website, email, phone) AS (
    VALUES
        ('ORGANISM', 'planning', 0, 'Plaza Mayor 1', 'Urbanismo', 'Gestion de licencias urbanisticas y disciplina territorial.', 'https://sede.example.org/urbanismo', 'urbanismo@ayto.example.org', '900100100'),
        ('ORGANISM', 'citizen', 1, 'Avenida Centro 12', 'Registro General', 'Atencion al ciudadano para tramites de registro y certificaciones.', 'https://sede.example.org/registro', 'registro@ayto.example.org', '900100200')
)
INSERT INTO public_content_entries (
    id, entry_kind, locale, category_code, value_type, title_text, body_text, external_url, download_url, related_procedure,
    sort_order, published, created_at, updated_at
)
SELECT
    (
        substr(md5(o.kind || '|' || l.locale || '|' || o.category_code || '|' || o.sort_order), 1, 8) || '-' ||
        substr(md5(o.kind || '|' || l.locale || '|' || o.category_code || '|' || o.sort_order), 9, 4) || '-' ||
        substr(md5(o.kind || '|' || l.locale || '|' || o.category_code || '|' || o.sort_order), 13, 4) || '-' ||
        substr(md5(o.kind || '|' || l.locale || '|' || o.category_code || '|' || o.sort_order), 17, 4) || '-' ||
        substr(md5(o.kind || '|' || l.locale || '|' || o.category_code || '|' || o.sort_order), 21, 12)
    )::uuid,
    o.kind,
    l.locale,
    o.category_code,
    l.prefix || o.address,
    l.prefix || o.name,
    l.prefix || o.description,
    o.website,
    o.email,
    o.phone,
    o.sort_order,
    true,
    NOW(),
    NOW()
FROM locales l
CROSS JOIN organism_entries o
WHERE NOT EXISTS (
    SELECT 1
    FROM public_content_entries e
    WHERE e.entry_kind = o.kind
      AND e.locale = l.locale
      AND e.category_code = o.category_code
      AND e.sort_order = o.sort_order
);

WITH locales(locale, prefix) AS (
    VALUES
        ('es-ES', ''),
        ('ca-ES', '[CA] '),
        ('eu-ES', '[EU] '),
        ('gl-ES', '[GL] '),
        ('va-ES', '[VA] ')
), resource_entries(kind, value_type, sort_order, title, description, content) AS (
    VALUES
        ('RESOURCE', 'glossary', 0, 'Certificado digital', 'Mecanismo de identificacion electronica para firma y autenticacion.', 'FNMT, Cl@ve'),
        ('RESOURCE', 'glossary', 1, 'Expediente', 'Conjunto de documentos y actuaciones asociadas a un procedimiento.', 'Procedimiento, Tramite')
)
INSERT INTO public_content_entries (
    id, entry_kind, locale, value_type, title_text, body_text, related_procedure,
    sort_order, published, created_at, updated_at
)
SELECT
    (
        substr(md5(r.kind || '|' || l.locale || '|' || r.value_type || '|' || r.sort_order), 1, 8) || '-' ||
        substr(md5(r.kind || '|' || l.locale || '|' || r.value_type || '|' || r.sort_order), 9, 4) || '-' ||
        substr(md5(r.kind || '|' || l.locale || '|' || r.value_type || '|' || r.sort_order), 13, 4) || '-' ||
        substr(md5(r.kind || '|' || l.locale || '|' || r.value_type || '|' || r.sort_order), 17, 4) || '-' ||
        substr(md5(r.kind || '|' || l.locale || '|' || r.value_type || '|' || r.sort_order), 21, 12)
    )::uuid,
    r.kind,
    l.locale,
    r.value_type,
    l.prefix || r.title,
    l.prefix || r.description,
    r.content,
    r.sort_order,
    true,
    NOW(),
    NOW()
FROM locales l
CROSS JOIN resource_entries r
WHERE NOT EXISTS (
    SELECT 1
    FROM public_content_entries e
    WHERE e.entry_kind = r.kind
      AND e.locale = l.locale
      AND e.value_type = r.value_type
      AND e.sort_order = r.sort_order
);
