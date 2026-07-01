-- Fix all @school.com user passwords to 'password123' (bcrypt cost 10)
-- The old hash in V16/V20/V21 was invalid, so no one could log in
UPDATE users
SET password_hash = '$2a$10$xqWeVbI6tYeW3wphUkZrOeHdnZIp4SqovGePgvP6YetQNoe0XCGqy'
WHERE email LIKE '%@school.com';
