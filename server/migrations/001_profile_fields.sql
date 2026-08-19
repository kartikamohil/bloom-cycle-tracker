-- Bloom profile data migration
-- Run this once in the Supabase SQL Editor before starting the updated server.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_period_start DATE;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS companions JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Keep the JSON structure predictable for existing rows.
UPDATE users
SET companions = '[]'::jsonb
WHERE companions IS NULL;

-- Optional but useful integrity check: companions must always be a JSON array.
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_companions_is_array;

ALTER TABLE users
  ADD CONSTRAINT users_companions_is_array
  CHECK (jsonb_typeof(companions) = 'array');
