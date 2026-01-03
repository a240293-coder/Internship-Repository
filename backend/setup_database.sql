-- Run this script as the 'root' user in MySQL Workbench to set up the user and database.

-- 1. Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS learnbetter_DB;

-- 2. Create the user 'learbetter' with the password 'Cool@1245'
-- If the user already exists, this might fail or do nothing depending on MySQL version, 
-- so we can try to drop it first or just use CREATE USER IF NOT EXISTS.
CREATE USER IF NOT EXISTS 'learbetter'@'localhost' IDENTIFIED BY 'Cool@1245';

-- 3. If the user already existed but had a different password, update it:
ALTER USER 'learbetter'@'localhost' IDENTIFIED BY 'Cool@1245';

-- 4. Grant full permissions to this user for the specific database
GRANT ALL PRIVILEGES ON learnbetter_DB.* TO 'learbetter'@'localhost';

-- 5. Apply the changes
FLUSH PRIVILEGES;
