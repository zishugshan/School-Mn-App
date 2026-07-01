-- Seed demo users for development and production testing
-- All passwords: password123 (bcrypt hash: $2a$10$xqWeVbI6tYeW3wphUkZrOeHdnZIp4SqovGePgvP6YetQNoe0XCGqy)

DO $$
BEGIN
    -- Super Admin
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'superadmin@school.com') THEN
        INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
        VALUES ('superadmin@school.com', '$2a$10$xqWeVbI6tYeW3wphUkZrOeHdnZIp4SqovGePgvP6YetQNoe0XCGqy', 'Super', 'Admin', 'SUPER_ADMIN', true);
    END IF;

    -- Teacher
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'mohan@school.com') THEN
        INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
        VALUES ('mohan@school.com', '$2a$10$xqWeVbI6tYeW3wphUkZrOeHdnZIp4SqovGePgvP6YetQNoe0XCGqy', 'Mohan', 'Verma', 'TEACHER', true);
    END IF;

    -- Student
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'sana@school.com') THEN
        INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
        VALUES ('sana@school.com', '$2a$10$xqWeVbI6tYeW3wphUkZrOeHdnZIp4SqovGePgvP6YetQNoe0XCGqy', 'Sana', 'Rahmani', 'STUDENT', true);
    END IF;

    -- Parent
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'imtiyaz.parent@school.com') THEN
        INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
        VALUES ('imtiyaz.parent@school.com', '$2a$10$xqWeVbI6tYeW3wphUkZrOeHdnZIp4SqovGePgvP6YetQNoe0XCGqy', 'Imtiyaz', 'Rahman', 'PARENT', true);
    END IF;
END $$;
