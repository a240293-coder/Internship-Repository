-- Add status column to mentor_sessions table
ALTER TABLE mentor_sessions 
ADD COLUMN status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled' AFTER meeting_link;
