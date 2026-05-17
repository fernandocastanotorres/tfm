-- Group existing translations under a common translation_group_id.
-- This fixes the i18n editing issue where each locale had its own group.

-- Create a helper function to generate a deterministic UUID from a string
CREATE OR REPLACE FUNCTION generate_deterministic_uuid(input_text TEXT) RETURNS UUID AS $$
BEGIN
    RETURN (
        substr(md5(input_text), 1, 8) || '-' ||
        substr(md5(input_text), 9, 4) || '-' ||
        substr(md5(input_text), 13, 4) || '-' ||
        substr(md5(input_text), 17, 4) || '-' ||
        substr(md5(input_text), 21, 12)
    )::uuid;
END;
$$ LANGUAGE plpgsql;

-- LEGISLATION: group by type + title (case-insensitive)
UPDATE public_content_entries e
SET translation_group_id = generate_deterministic_uuid(
    'LEGISLATION|' || lower(trim(e.value_type)) || '|' || lower(trim(e.title_text))
)
WHERE e.entry_kind = 'LEGISLATION';

-- FAQ_CATEGORY: group by category_code
UPDATE public_content_entries e
SET translation_group_id = generate_deterministic_uuid(
    'FAQ_CATEGORY|' || lower(trim(e.category_code))
)
WHERE e.entry_kind = 'FAQ_CATEGORY' AND e.category_code IS NOT NULL;

-- FAQ: group by category_code + question (case-insensitive)
UPDATE public_content_entries e
SET translation_group_id = generate_deterministic_uuid(
    'FAQ|' || lower(trim(e.category_code)) || '|' || lower(trim(e.title_text))
)
WHERE e.entry_kind = 'FAQ' AND e.category_code IS NOT NULL;

-- CALENDAR: group by type + title (case-insensitive)
UPDATE public_content_entries e
SET translation_group_id = generate_deterministic_uuid(
    'CALENDAR|' || lower(trim(e.value_type)) || '|' || lower(trim(e.title_text))
)
WHERE e.entry_kind = 'CALENDAR';

-- INSTITUTIONAL: group by section_code
UPDATE public_content_entries e
SET translation_group_id = generate_deterministic_uuid(
    'INSTITUTIONAL|' || lower(trim(e.category_code))
)
WHERE e.entry_kind = 'INSTITUTIONAL' AND e.category_code IS NOT NULL;

-- ORGANISM: group by category_code + name (case-insensitive)
UPDATE public_content_entries e
SET translation_group_id = generate_deterministic_uuid(
    'ORGANISM|' || lower(trim(e.category_code)) || '|' || lower(trim(e.title_text))
)
WHERE e.entry_kind = 'ORGANISM' AND e.category_code IS NOT NULL;

-- ORGANISM_CATEGORY: group by category_code
UPDATE public_content_entries e
SET translation_group_id = generate_deterministic_uuid(
    'ORGANISM_CATEGORY|' || lower(trim(e.category_code))
)
WHERE e.entry_kind = 'ORGANISM_CATEGORY' AND e.category_code IS NOT NULL;

-- RESOURCE: group by resource_type + title (case-insensitive)
UPDATE public_content_entries e
SET translation_group_id = generate_deterministic_uuid(
    'RESOURCE|' || lower(trim(e.value_type)) || '|' || lower(trim(e.title_text))
)
WHERE e.entry_kind = 'RESOURCE';

-- THEME: group by theme id (category_code)
UPDATE public_content_entries e
SET translation_group_id = generate_deterministic_uuid(
    'THEME|' || lower(trim(e.category_code))
)
WHERE e.entry_kind = 'THEME' AND e.category_code IS NOT NULL;

-- Clean up the helper function
DROP FUNCTION IF EXISTS generate_deterministic_uuid(TEXT);
