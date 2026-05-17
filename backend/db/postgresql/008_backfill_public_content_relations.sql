-- Normalize legacy relation fields into parent_group_id when possible.

-- FAQ entries -> FAQ_CATEGORY group relation
UPDATE public_content_entries faq
SET parent_group_id = cat.translation_group_id
FROM public_content_entries cat
WHERE faq.entry_kind = 'FAQ'
  AND cat.entry_kind = 'FAQ_CATEGORY'
  AND faq.parent_group_id IS NULL
  AND faq.category_code IS NOT NULL
  AND cat.category_code = faq.category_code
  AND cat.locale = 'es-ES';

-- Ensure organism category dictionary exists from existing organism rows.
INSERT INTO public_content_entries (
    id, translation_group_id, parent_group_id, entry_kind, locale, category_code,
    value_type, title_text, body_text, sort_order, published, created_at, updated_at
)
SELECT
    gen.id,
    gen.id,
    NULL,
    'ORGANISM_CATEGORY',
    'es-ES',
    lower(trim(org.category_code)),
    NULL,
    initcap(replace(lower(trim(org.category_code)), '-', ' ')),
    '',
    0,
    true,
    NOW(),
    NOW()
FROM (
    SELECT DISTINCT category_code
    FROM public_content_entries
    WHERE entry_kind = 'ORGANISM'
      AND category_code IS NOT NULL
) org
CROSS JOIN LATERAL (
    SELECT (
        substr(md5('ORGANISM_CATEGORY|' || lower(trim(org.category_code))), 1, 8) || '-' ||
        substr(md5('ORGANISM_CATEGORY|' || lower(trim(org.category_code))), 9, 4) || '-' ||
        substr(md5('ORGANISM_CATEGORY|' || lower(trim(org.category_code))), 13, 4) || '-' ||
        substr(md5('ORGANISM_CATEGORY|' || lower(trim(org.category_code))), 17, 4) || '-' ||
        substr(md5('ORGANISM_CATEGORY|' || lower(trim(org.category_code))), 21, 12)
    )::uuid AS id
) gen
WHERE NOT EXISTS (
    SELECT 1
    FROM public_content_entries e
    WHERE e.entry_kind = 'ORGANISM_CATEGORY'
      AND e.category_code = lower(trim(org.category_code))
      AND e.locale = 'es-ES'
);

-- ORGANISM entries -> ORGANISM_CATEGORY relation
UPDATE public_content_entries org
SET parent_group_id = cat.translation_group_id
FROM public_content_entries cat
WHERE org.entry_kind = 'ORGANISM'
  AND cat.entry_kind = 'ORGANISM_CATEGORY'
  AND org.parent_group_id IS NULL
  AND org.category_code IS NOT NULL
  AND cat.category_code = lower(trim(org.category_code))
  AND cat.locale = 'es-ES';
