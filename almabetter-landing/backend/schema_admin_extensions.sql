-- Migration: Admin Live Session Management Extensions

-- 1. live_sessions table (add columns for status, completed_at, is_deleted, deleted_at)
ALTER TABLE live_sessions
  ADD COLUMN status ENUM('PENDING','ONGOING','COMPLETED') DEFAULT 'PENDING' AFTER topic,
  ADD COLUMN completed_at TIMESTAMP NULL AFTER status,
  ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE AFTER completed_at,
  ADD COLUMN deleted_at TIMESTAMP NULL AFTER is_deleted;

-- 2. admin_activity_logs (audit trail)
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  reference_id INT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. mentor_assignments
CREATE TABLE IF NOT EXISTS mentor_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mentor_id INT NOT NULL,
  student_id INT NOT NULL,
  assigned_by_admin INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_student_mentor (student_id, mentor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
