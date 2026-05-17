-- Fix sortOrder consistency within translation groups.
-- The localize() method uses sortOrder as part of the grouping key,
-- so all translations of the same content must share the same sortOrder.

-- Update sortOrder to be consistent within each translation group.
-- Uses the minimum sortOrder from each group as the canonical value.
UPDATE public_content_entries e
SET sort_order = group_min.sort_order
FROM (
    SELECT translation_group_id, MIN(sort_order) AS sort_order
    FROM public_content_entries
    WHERE translation_group_id IS NOT NULL
    GROUP BY translation_group_id
) group_min
WHERE e.translation_group_id = group_min.translation_group_id
  AND e.sort_order != group_min.sort_order;
