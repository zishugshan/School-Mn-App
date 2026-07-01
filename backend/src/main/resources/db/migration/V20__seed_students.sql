-- Seed 72 student users + student records + class linking
-- Password: SCHOOL@2024 (bcrypt hash)
DO $$
BEGIN
    IF (SELECT COUNT(*) > 10 FROM students) THEN
        RAISE NOTICE 'Students exist, skipping V20';
        RETURN;
    END IF;

    INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
    SELECT
        'student' || g || '@school.com',
        '$2a$10$6Dc4D2HHB3c3b73wKTetgegc.Z0U8a67AOzPRWHXzxEml1E.Jsw5W',
        (ARRAY['Arun','Bhavna','Chirag','Deepa','Ekta','Faisal','Gauri','Hemant','Isha','Jatin','Kavita','Lokesh','Mamta','Naresh','Parul','Radhika','Sachin','Tanvi','Usha','Varun','Yash','Anjali','Brijesh','Chandan','Divya','Gaurav','Hina','Irfan','Jyoti','Karan','Lavanya','Manish','Neha','Pooja','Rahul','Shreya','Tushar','Amit','Babita','Dinesh','Lalit','Mohit','Nidhi','Priya','Rohan','Sneha','Vikas','Arpita','Bhavana','Chetan','Dhruv','Farhan','Girish','Harsh','Kabir','Kirti','Manoj','Nitin','Rekha','Sonal','Vinod','Aarav','Aryan','Dev','Ishita','Krishna','Mira','Ravi','Sana','Tara','Zara','Aisha','Kajal','Ritika','Suresh','Swati'])[g],
        (ARRAY['Sharma','Verma','Gupta','Kumar','Singh','Yadav','Joshi','Patel','Das','Mehra','Saxena','Malhotra','Chopra','Reddy','Naidu','Iyer','Menon','Pandey','Dwivedi','Chatterjee','Tiwari','Dubey','Mishra','Bhatt','Rao','Kapoor','Nair','Ahuja','Srinivasan','Deshmukh','Bajaj','Choudhury','Lal','Agarwal','Khanna','Mehta','Sethi','Bose','Sen','Ghosh'])[(g % 40) + 1],
        'STUDENT', true
    FROM generate_series(1, 72) g;

    INSERT INTO students (user_id, student_code, date_of_birth, gender)
    SELECT
        u.id,
        UPPER(SUBSTRING(MD5(RANDOM()::TEXT || u.id) FROM 1 FOR 6)),
        CURRENT_DATE - INTERVAL '8 years' - (u.id || ' days')::INTERVAL,
        CASE WHEN u.id % 2 = 0 THEN 'FEMALE' ELSE 'MALE' END
    FROM users u
    WHERE u.role = 'STUDENT' AND u.id > (SELECT COALESCE(MIN(id), 0) FROM users WHERE role = 'PARENT')
    ORDER BY u.id;

    INSERT INTO student_class (student_id, class_id, section_id, academic_year, is_active)
    SELECT
        s.id, c.id, sec.id,
        TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || TO_CHAR(CURRENT_DATE + INTERVAL '1 year', 'YY'),
        true
    FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY id) - 1 AS rn
        FROM students
        WHERE user_id > (SELECT COALESCE(MIN(id), 0) FROM users WHERE role = 'PARENT')
    ) s
    JOIN (SELECT id, ROW_NUMBER() OVER (ORDER BY id) - 1 AS rn FROM classes) c ON c.rn = s.rn / 3
    JOIN (SELECT id, ROW_NUMBER() OVER (ORDER BY id) - 1 AS rn FROM sections) sec ON sec.rn = s.rn % 3 + c.rn * 3;
END $$;
