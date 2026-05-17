ALTER TABLE public_content_entries
    ADD COLUMN IF NOT EXISTS translation_group_id UUID,
    ADD COLUMN IF NOT EXISTS parent_group_id UUID;

UPDATE public_content_entries
SET translation_group_id = id
WHERE translation_group_id IS NULL;

ALTER TABLE public_content_entries
    ALTER COLUMN translation_group_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_public_content_entries_group ON public_content_entries(translation_group_id);
CREATE INDEX IF NOT EXISTS idx_public_content_entries_parent_group ON public_content_entries(parent_group_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_public_content_entries_group_locale
    ON public_content_entries(entry_kind, translation_group_id, locale);
