-- Migration: Create separate admins table
-- Run this if you already have an existing database

-- Create admins table for regular admins
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migrate existing admins from super_admins table (if any exist with role='admin')
INSERT INTO admins (full_name, email, password, created_at)
SELECT full_name, email, password, created_at 
FROM super_admins 
WHERE role = 'admin'
ON DUPLICATE KEY UPDATE email=email;

-- Remove regular admins from super_admins table (keep only super_admin)
DELETE FROM super_admins WHERE role = 'admin';

-- Update super_admins table structure
ALTER TABLE super_admins 
    MODIFY COLUMN role VARCHAR(50) DEFAULT 'super_admin',
    DROP INDEX IF EXISTS unique_super_admin_flag,
    DROP COLUMN IF EXISTS super_admin_flag;
