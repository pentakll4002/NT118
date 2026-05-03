-- Add 'pending' value to shop_status enum
ALTER TYPE shop_status ADD VALUE IF NOT EXISTS 'pending' BEFORE 'active';

-- Add new columns to shops table
ALTER TABLE shops
  ADD COLUMN IF NOT EXISTS business_hours VARCHAR(200),
  ADD COLUMN IF NOT EXISTS type VARCHAR(20) NOT NULL DEFAULT 'individual';

-- Update existing GearVN-style shops (business accounts) if any
-- These would be shops that were seeded directly, mark them as business + active + verified
UPDATE shops 
SET type = 'business', status = 'active', is_verified = true
WHERE status = 'active' AND is_verified = false AND total_products > 10;

-- Ensure existing active shops remain active (don't break current data)
UPDATE shops SET status = 'active' WHERE status != 'pending' AND status != 'inactive' AND status != 'suspended';
