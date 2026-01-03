DROP TABLE IF EXISTS jwt_sessions;
DROP TABLE IF EXISTS dashboards;
DROP TABLE IF EXISTS interest_forms;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS live_sessions;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS mentors;
DROP TABLE IF EXISTS students;

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    interests TEXT,
    domain VARCHAR(255),
    previous_experience TEXT,
    career_goals TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE mentors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    expertise VARCHAR(255),
    experience_years INT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE live_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    preferred_date DATE,
    preferred_time VARCHAR(50),
    message TEXT,
    status ENUM('pending','confirmed','completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dashboards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  user_role ENUM('student','mentor','admin'),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE jwt_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  role VARCHAR(20),
  token TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE interest_forms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    student_name VARCHAR(255),
    student_email VARCHAR(255),
    interests TEXT,
    desired_domain VARCHAR(255),
    experience TEXT,
    goals TEXT,
    resume_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
