-- Seed 21 teacher users + teacher records + subject assignments
-- Password: SCHOOL@2024 (bcrypt hash)
DO $$
BEGIN
    IF (SELECT COUNT(*) > 10 FROM teachers) THEN
        RAISE NOTICE 'Teachers exist, skipping V21';
        RETURN;
    END IF;

    INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) VALUES
    ('mohan.verma@school.com',   '$2a$10$6Dc4D2HHB3c3b73wKTetgegc.Z0U8a67AOzPRWHXzxEml1E.Jsw5W', 'Mohan',   'Verma',   'TEACHER', true),
    ('bhavana.lal@school.com',   '$2a$10$6Dc4D2HHB3c3b73wKTetgegc.Z0U8a67AOzPRWHXzxEml1E.Jsw5W', 'Bhavana', 'Lal',     'TEACHER', true),
    ('ramesh.iyer@school.com',   '$2a$10$6Dc4D2HHB3c3b73wKTetgegc.Z0U8a67AOzPRWHXzxEml1E.Jsw5W', 'Ramesh',  'Iyer',    'TEACHER', true),
    ('brijesh.menon@school.com', '$2a$10$6Dc4D2HHB3c3b73wKTetgegc.Z0U8a67AOzPRWHXzxEml1E.Jsw5W', 'Brijesh', 'Menon',   'TEACHER', true),
    ('bhavana.bhatt@school.com', '$2a$10$6Dc4D2HHB3c3b73wKTetgegc.Z0U8a67AOzPRWHXzxEml1E.Jsw5W', 'Bhavana', 'Bhatt',   'TEACHER', true),
    ('reema.chopra@school.com',  '$2a$10$6Dc4D2HHB3c3b73wKTetgegc.Z0U8a67AOzPRWHXzxEml1E.Jsw5W', 'Reema',   'Chopra',  'TEACHER', true),
    ('dinesh.malhotra@school.com','$2a$10$6Dc4D2HHB3c3b73wKTetgegc.Z0U8a67AOzPRWHXzxEml1E.Jsw5W','Dinesh',  'Malhotra','TEACHER', true),
    ('ramesh.kumar@school.com',  '$2a$10$6Dc4D2HHB3c3b73wKTetgegc.Z0U8a67AOzPRWHXzxEml1E.Jsw5W', 'Ramesh',  'Kumar',   'TEACHER', true),
    ('usha.tiwari@school.com',   '$2a$10$6Dc4D2HHB3c3b73wKTetgegc.Z0U8a67AOzPRWHXzxEml1E.Jsw5W', 'Usha',    'Tiwari',  'TEACHER', true),
    ('mamta.singh@school.com',   '$2a$10$6Dc4D2HHB3c3b73wKTetgegc.Z0U8a67AOzPRWHXzxEml1E.Jsw5W', 'Mamta',   'Singh',   'TEACHER', true),
    ('brijesh.choudhury@school.com','$2a$10$6Dc4D2HHB3c3b73wKTetgegc.Z0U8a67AOzPRWHXzxEml1E.Jsw5W','Brijesh','Choudhury','TEACHER', true),
    ('naresh.iyer@school.com',   '$2a$10$6Dc4D2HHB3c3b73wKTetgegc.Z0U8a67AOzPRWHXzxEml1E.Jsw5W', 'Naresh',  'Iyer',    'TEACHER', true),
    ('reema.pandey@school.com',  '$2a$10$6Dc4D2HHB3c3b73wKTetgegc.Z0U8a67AOzPRWHXzxEml1E.Jsw5W', 'Reema',   'Pandey',  'TEACHER', true),
    ('dinesh.kapoor@school.com', '$2a$10$6Dc4D2HHB3c3b73wKTetgegc.Z0U8a67AOzPRWHXzxEml1E.Jsw5W', 'Dinesh',  'Kapoor',  'TEACHER', true),
    ('poonam.reddy@school.com',  '$2a$10$6Dc4D2HHB3c3b73wKTetgegc.Z0U8a67AOzPRWHXzxEml1E.Jsw5W', 'Poonam',  'Reddy',   'TEACHER', true),
    ('suresh.nair@school.com',   '$2a$10$6Dc4D2HHB3c3b73wKTetgegc.Z0U8a67AOzPRWHXzxEml1E.Jsw5W', 'Suresh',  'Nair',    'TEACHER', true),
    ('shalini.naidu@school.com', '$2a$10$6Dc4D2HHB3c3b73wKTetgegc.Z0U8a67AOzPRWHXzxEml1E.Jsw5W', 'Shalini', 'Naidu',   'TEACHER', true),
    ('girish.kapoor@school.com', '$2a$10$6Dc4D2HHB3c3b73wKTetgegc.Z0U8a67AOzPRWHXzxEml1E.Jsw5W', 'Girish',  'Kapoor',  'TEACHER', true),
    ('asha.lal@school.com',      '$2a$10$6Dc4D2HHB3c3b73wKTetgegc.Z0U8a67AOzPRWHXzxEml1E.Jsw5W', 'Asha',    'Lal',     'TEACHER', true),
    ('dinesh.rao@school.com',    '$2a$10$6Dc4D2HHB3c3b73wKTetgegc.Z0U8a67AOzPRWHXzxEml1E.Jsw5W', 'Dinesh',  'Rao',     'TEACHER', true),
    ('amresh.menon@school.com',  '$2a$10$6Dc4D2HHB3c3b73wKTetgegc.Z0U8a67AOzPRWHXzxEml1E.Jsw5W', 'Amresh',  'Menon',   'TEACHER', true);

    INSERT INTO teachers (user_id, teacher_code, qualification, gender)
    SELECT u.id, 'TCH-' || LPAD((ROW_NUMBER() OVER (ORDER BY u.id))::TEXT, 3, '0'),
           'M.Sc. Mathematics', CASE WHEN u.first_name LIKE '%a' THEN 'FEMALE' ELSE 'MALE' END
    FROM users u WHERE u.email LIKE '%@school.com' AND u.email NOT IN ('superadmin@school.com','imtiyaz.parent@school.com','sana@school.com')
      AND u.id > (SELECT MAX(id) FROM users WHERE role = 'STUDENT');

    INSERT INTO teacher_subject (teacher_id, subject_id)
    SELECT t.id, s.id
    FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY id) rn FROM teachers) t
    CROSS JOIN LATERAL (
        SELECT id FROM subjects
        WHERE name = ANY(
            CASE WHEN t.rn = 1 THEN ARRAY['Mathematics','Science','Physics']
                 WHEN t.rn = 2 THEN ARRAY['Mathematics', 'Physical Education']
                 WHEN t.rn = 3 THEN ARRAY['Mathematics', 'General']
                 WHEN t.rn = 4 THEN ARRAY['English']
                 WHEN t.rn = 5 THEN ARRAY['English']
                 WHEN t.rn = 6 THEN ARRAY['Science']
                 WHEN t.rn = 7 THEN ARRAY['Science']
                 WHEN t.rn = 8 THEN ARRAY['Social Studies']
                 WHEN t.rn = 9 THEN ARRAY['Social Studies']
                 WHEN t.rn = 10 THEN ARRAY['Hindi']
                 WHEN t.rn = 11 THEN ARRAY['Hindi']
                 WHEN t.rn = 12 THEN ARRAY['Science']
                 WHEN t.rn = 13 THEN ARRAY['Science']
                 WHEN t.rn = 14 THEN ARRAY['Physics','Computer Science']
                 WHEN t.rn = 15 THEN ARRAY['Physics','Computer Science']
                 WHEN t.rn = 16 THEN ARRAY['Chemistry']
                 WHEN t.rn = 17 THEN ARRAY['Chemistry']
                 WHEN t.rn = 18 THEN ARRAY['Biology']
                 WHEN t.rn = 19 THEN ARRAY['Biology']
                 WHEN t.rn = 20 THEN ARRAY['Science']
                 WHEN t.rn = 21 THEN ARRAY['Science']
            END
        )
    ) s
    WHERE NOT EXISTS (SELECT 1 FROM teacher_subject WHERE teacher_id = t.id AND subject_id = s.id);
END $$;
