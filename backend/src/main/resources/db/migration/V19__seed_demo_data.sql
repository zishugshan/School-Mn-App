-- Seed comprehensive demo data for development and production testing
-- Password for all imported users: SCHOOL@2024 (bcrypt hash)
-- Requires V16 (demo users), V17, V18 to have run first
-- Uses bulk INSERTs for performance (avoids PL/pgSQL row-by-row loops)

DO $$
BEGIN
    IF (SELECT COUNT(*) > 10 FROM students) THEN
        RAISE NOTICE 'Demo data exists, skipping';
        RETURN;
    END IF;

-- ============================================================
-- 1. CREATE STUDENT USERS + STUDENT RECORDS (72 students)
-- ============================================================
-- Insert student users
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
SELECT
    'student' || g || '@school.com',
    '$2a$10$6Dc4D2HHB3c3b73wKTetgegc.Z0U8a67AOzPRWHXzxEml1E.Jsw5W',
    (ARRAY['Arun','Bhavna','Chirag','Deepa','Ekta','Faisal','Gauri','Hemant','Isha','Jatin','Kavita','Lokesh','Mamta','Naresh','Parul','Radhika','Sachin','Tanvi','Usha','Varun','Yash','Anjali','Brijesh','Chandan','Divya','Gaurav','Hina','Irfan','Jyoti','Karan','Lavanya','Manish','Neha','Pooja','Rahul','Shreya','Tushar','Amit','Babita','Dinesh','Lalit','Mohit','Nidhi','Priya','Rohan','Sneha','Vikas','Arpita','Bhavana','Chetan','Dhruv','Farhan','Girish','Harsh','Kabir','Kirti','Manoj','Nitin','Rekha','Sonal','Vinod','Aarav','Aryan','Dev','Ishita','Krishna','Mira','Ravi','Sana','Tara','Zara','Aisha','Kajal','Ritika','Suresh','Swati'])[g],
    (ARRAY['Sharma','Verma','Gupta','Kumar','Singh','Yadav','Joshi','Patel','Das','Mehra','Saxena','Malhotra','Chopra','Reddy','Naidu','Iyer','Menon','Pandey','Dwivedi','Chatterjee','Tiwari','Dubey','Mishra','Bhatt','Rao','Kapoor','Nair','Ahuja','Srinivasan','Deshmukh','Bajaj','Choudhury','Lal','Agarwal','Khanna','Mehta','Sethi','Bose','Sen','Ghosh'])[(g % 40) + 1],
    'STUDENT', true
FROM generate_series(1, 72) g;

-- Insert student records
INSERT INTO students (user_id, student_code, date_of_birth, gender)
SELECT
    u.id,
    UPPER(SUBSTRING(MD5(RANDOM()::TEXT || u.id) FROM 1 FOR 6)),
    CURRENT_DATE - INTERVAL '8 years' - (u.id || ' days')::INTERVAL,
    CASE WHEN u.id % 2 = 0 THEN 'FEMALE' ELSE 'MALE' END
FROM users u
WHERE u.role = 'STUDENT' AND u.id > (SELECT COALESCE(MIN(id), 0) FROM users WHERE role = 'PARENT')
ORDER BY u.id;

-- Link students to classes (2 per section, 3 sections per class, 12 classes = 72)
INSERT INTO student_class (student_id, class_id, section_id, academic_year, is_active)
SELECT
    s.id,
    c.id,
    sec.id,
    TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || TO_CHAR(CURRENT_DATE + INTERVAL '1 year', 'YY'),
    true
FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) - 1 AS rn
    FROM students
    WHERE user_id > (SELECT COALESCE(MIN(id), 0) FROM users WHERE role = 'PARENT')
) s
JOIN (SELECT id, ROW_NUMBER() OVER (ORDER BY id) - 1 AS rn FROM classes) c ON c.rn = s.rn / 3
JOIN (SELECT id, ROW_NUMBER() OVER (ORDER BY id) - 1 AS rn FROM sections) sec ON sec.rn = s.rn % 3 + c.rn * 3;

RAISE NOTICE '1. Created 72 students';

-- ============================================================
-- 2. CREATE TEACHER USERS (21 teachers)
-- ============================================================
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
VALUES
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

-- Insert teacher records
INSERT INTO teachers (user_id, teacher_code, qualification, gender)
SELECT u.id, 'TCH-' || LPAD((ROW_NUMBER() OVER (ORDER BY u.id))::TEXT, 3, '0'),
       'M.Sc. Mathematics', CASE WHEN u.first_name LIKE '%a' THEN 'FEMALE' ELSE 'MALE' END
FROM users u WHERE u.email LIKE '%@school.com' AND u.email NOT IN ('superadmin@school.com','imtiyaz.parent@school.com','sana@school.com')
  AND u.id > (SELECT MAX(id) FROM users WHERE role = 'STUDENT');

-- Assign teachers to subjects
INSERT INTO teacher_subject (teacher_id, subject_id)
SELECT t.id, s.id
FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY id) rn FROM teachers) t
CROSS JOIN LATERAL (
    SELECT id FROM subjects
    WHERE name = ANY(
        CASE WHEN t.rn = 1 THEN ARRAY['Mathematics','Science','Physics']
             WHEN t.rn = 2 THEN ARRAY['Mathematics']
             WHEN t.rn = 3 THEN ARRAY['Mathematics']
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

RAISE NOTICE '2. Created 21 teachers';

-- ============================================================
-- 3. LINK SUBJECTS TO CLASSES
-- ============================================================
INSERT INTO class_subject (class_id, subject_id)
SELECT c.id, s.id
FROM classes c
JOIN subjects s ON (
    CASE WHEN CAST(SUBSTRING(c.name FROM 7) AS INT) <= 5 THEN s.name IN ('Mathematics','English','Science','Hindi')
         WHEN CAST(SUBSTRING(c.name FROM 7) AS INT) <= 8 THEN s.name IN ('Mathematics','English','Science','Social Studies','Hindi','Computer Science')
         WHEN CAST(SUBSTRING(c.name FROM 7) AS INT) <= 10 THEN s.name IN ('Mathematics','English','Science','Social Studies','Hindi','Computer Science','Physical Education')
         ELSE s.name IN ('Physics','Chemistry','Biology','Mathematics','English')
    END
)
WHERE NOT EXISTS (SELECT 1 FROM class_subject WHERE class_id = c.id AND subject_id = s.id);
RAISE NOTICE '3. Linked subjects to classes';

-- ============================================================
-- 4. GENERATE ATTENDANCE (5 days)
-- ============================================================
INSERT INTO attendance (student_id, class_id, section_id, date, status, marked_by)
SELECT s.id, sc.class_id, sc.section_id, d.d,
       (ARRAY['PRESENT','PRESENT','PRESENT','PRESENT','PRESENT','PRESENT','PRESENT','ABSENT','LATE','LEAVE'])[LEAST((RANDOM() * 10)::INT, 9) + 1],
       (SELECT id FROM users WHERE email = 'superadmin@school.com')
FROM students s
JOIN student_class sc ON sc.student_id = s.id AND sc.is_active = true
CROSS JOIN (SELECT (CURRENT_DATE - 6 + g) AS d FROM generate_series(0,4) g) d
WHERE EXTRACT(DOW FROM d.d) BETWEEN 1 AND 5
ON CONFLICT DO NOTHING;
RAISE NOTICE '4. Generated attendance';

-- ============================================================
-- 5. CREATE TESTS (2-4 per class/section)
-- ============================================================
INSERT INTO tests (title, subject_id, class_id, section_id, teacher_id, maximum_marks, passing_marks, test_date, exam_type, is_published)
SELECT
    'Class Test - ' || s.name,
    s.id,
    c.id,
    sec.id,
    COALESCE((SELECT ts.teacher_id FROM teacher_subject ts WHERE ts.subject_id = s.id LIMIT 1), 1),
    100, 35,
    CASE WHEN RANDOM() < 0.4 THEN CURRENT_DATE - ((RANDOM() * 10 + 1)::INT || ' days')::INTERVAL
         ELSE CURRENT_DATE + ((RANDOM() * 14 + 1)::INT || ' days')::INTERVAL END,
    'QUIZ', true
FROM classes c
JOIN sections sec ON sec.class_id = c.id
JOIN subjects s ON (
    CASE WHEN CAST(SUBSTRING(c.name FROM 7) AS INT) <= 5 THEN s.name IN ('Mathematics','English')
         WHEN CAST(SUBSTRING(c.name FROM 7) AS INT) <= 8 THEN s.name IN ('Mathematics','Science','English')
         WHEN CAST(SUBSTRING(c.name FROM 7) AS INT) <= 10 THEN s.name IN ('Mathematics','Science','English','Social Studies')
         ELSE s.name IN ('Physics','Chemistry','Biology','Mathematics')
    END
);
RAISE NOTICE '5. Created tests';

-- ============================================================
-- 6. ENTER MARKS
-- ============================================================
INSERT INTO marks (test_id, student_id, marks_obtained, entered_by)
SELECT t.id, s.id, (RANDOM() * 75 + 25)::INT, (SELECT id FROM users WHERE email = 'superadmin@school.com')
FROM tests t
JOIN student_class sc ON sc.class_id = t.class_id AND sc.section_id = t.section_id AND sc.is_active = true
JOIN students s ON s.id = sc.student_id
WHERE t.test_date < CURRENT_DATE
ON CONFLICT (test_id, student_id) DO UPDATE SET marks_obtained = EXCLUDED.marks_obtained;
RAISE NOTICE '6. Entered marks';

-- ============================================================
-- 7. EXAM SCHEDULES
-- ============================================================
INSERT INTO exam_schedules (title, class_id, subject_id, exam_type, date, start_time, end_time, room_number)
SELECT 'Mid-Term - ' || s.name, c.id, s.id, 'MIDTERM', CURRENT_DATE + INTERVAL '75 days', '09:00:00', '12:00:00', 'Room ' || (100 + (s.id * 7 + c.id * 3) % 200)
FROM classes c
JOIN subjects s ON s.id IN (SELECT subject_id FROM class_subject WHERE class_id = c.id);

INSERT INTO exam_schedules (title, class_id, subject_id, exam_type, date, start_time, end_time, room_number)
SELECT 'Final - ' || s.name, c.id, s.id, 'FINAL', CURRENT_DATE + INTERVAL '160 days', '09:00:00', '12:00:00', 'Room ' || (150 + (s.id * 11 + c.id * 5) % 200)
FROM classes c
JOIN subjects s ON s.id IN (SELECT subject_id FROM class_subject WHERE class_id = c.id);
RAISE NOTICE '7. Created exam schedules';

-- ============================================================
-- 8. HOMEWORK (2 per class)
-- ============================================================
DECLARE
    hw_id BIGINT;
    cid INT;
    cname VARCHAR;
    subj_name VARCHAR;
    subj_id INT;
    tid INT;
BEGIN
    FOR cid IN (SELECT id FROM classes ORDER BY id) LOOP
        SELECT name INTO cname FROM classes WHERE id = cid;
        FOREACH subj_name IN ARRAY ARRAY['Mathematics', 'English'] LOOP
            SELECT id INTO subj_id FROM subjects WHERE name = subj_name;
            CONTINUE WHEN subj_id IS NULL;
            SELECT ts.teacher_id INTO tid FROM teacher_subject ts WHERE ts.subject_id = subj_id LIMIT 1;
            CONTINUE WHEN tid IS NULL;
            INSERT INTO homework (title, description, subject_id, teacher_id, due_date, max_score)
            VALUES (subj_name || ' Homework - ' || cname,
                    'Complete the ' || subj_name || ' assignment. Submit by due date.',
                    subj_id, tid, CURRENT_DATE + INTERVAL '7 days', 50)
            RETURNING id INTO hw_id;
            INSERT INTO homework_target (homework_id, class_id, section_id)
            SELECT hw_id, cid, id FROM sections WHERE class_id = cid;
        END LOOP;
    END LOOP;
END;
RAISE NOTICE '8. Created homework assignments';

-- ============================================================
-- 9. STUDENT GOALS
-- ============================================================
INSERT INTO student_goals (student_id, user_id, title, description, target_date, target_score, current_progress, category, unit)
SELECT
    s.id, s.user_id,
    CASE (RANDOM() * 2)::INT
        WHEN 0 THEN 'Improve Math score'
        WHEN 1 THEN 'Perfect attendance this month'
        ELSE 'Complete all homework on time'
    END,
    'Personal academic goal',
    CURRENT_DATE + ((RANDOM() * 60 + 30)::INT || ' days')::INTERVAL,
    (RANDOM() * 20 + 80)::INT,
    (RANDOM() * 50 + 30)::INT,
    CASE (RANDOM() * 2)::INT
        WHEN 0 THEN 'Academic'
        WHEN 1 THEN 'Attendance'
        ELSE 'Behavior'
    END,
    'Percentage'
FROM students s;
RAISE NOTICE '9. Created student goals';

-- ============================================================
-- 10. LIBRARY BOOKS
-- ============================================================
INSERT INTO library_books (title, author, isbn, publisher, category, quantity, available, shelf_location) VALUES
('ABC of English', 'R.K. Gupta', '9780143101001', 'Penguin', 'Class 1-3', 5, 5, 'A1'),
('Math Magic', 'S. Sharma', '9780143101002', 'NCERT', 'Class 1-3', 5, 5, 'A2'),
('Science Around Us', 'P. Verma', '9780143101003', 'Oxford', 'Class 1-3', 5, 5, 'B1'),
('Hindi Varnmala', 'A. Singh', '9780143101004', 'Hindi Pustak', 'Class 1-3', 5, 5, 'B2'),
('Fun with Numbers', 'M. Joshi', '9780143101005', 'Cambridge', 'Class 1-3', 5, 5, 'C1'),
('English Grammar & Composition', 'Wren & Martin', '9780143101006', 'S. Chand', 'Class 4-6', 5, 5, 'C2'),
('General Science', 'Lakhmir Singh', '9780143101007', 'S. Chand', 'Class 4-6', 5, 5, 'D1'),
('Social Studies Basics', 'R. Jain', '9780143101008', 'Ratna Sagar', 'Class 4-6', 5, 5, 'D2'),
('Mathematics for Middle School', 'R.S. Aggarwal', '9780143101009', 'Arya', 'Class 4-6', 5, 5, 'E1'),
('Computer Fundamentals', 'V. Rajaraman', '9780143101010', 'PHI', 'Class 4-6', 5, 5, 'E2'),
('Physics Foundation', 'H.C. Verma', '9780143101011', 'Bharati', 'Class 7-9', 5, 5, 'F1'),
('Chemistry Basics', 'O.P. Tandon', '9780143101012', 'S. Chand', 'Class 7-9', 5, 5, 'F2'),
('Biology Essentials', 'Trueman', '9780143101013', 'Arihant', 'Class 7-9', 5, 5, 'G1'),
('Advanced Mathematics', 'R.D. Sharma', '9780143101014', 'Dhanpat Rai', 'Class 7-9', 5, 5, 'G2'),
('English Literature Reader', 'Various', '9780143101015', 'Oxford', 'Class 7-9', 5, 5, 'H1'),
('Science for Class 10', 'NCERT', '9780143101016', 'NCERT', 'Class 10-12', 5, 5, 'H2'),
('Mathematics for Class 11', 'R.S. Aggarwal', '9780143101017', 'Arya', 'Class 10-12', 5, 5, 'I1'),
('Physics Part I & II', 'Resnick Halliday', '9780143101018', 'Wiley', 'Class 10-12', 5, 5, 'I2'),
('Organic Chemistry', 'Morrison & Boyd', '9780143101019', 'Pearson', 'Class 10-12', 5, 5, 'J1'),
('Reference Encyclopedia', 'Britannica', '9780143101020', 'Encyclopedia', 'Reference', 3, 3, 'J2');
RAISE NOTICE '10. Added 20 library books';

-- ============================================================
-- 11. DIGITAL RESOURCES (PDF + Links)
-- ============================================================
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
SELECT * FROM (VALUES
('Mathematics Formulas Sheet', 'Formula reference', 'PDF', 'https://library.school.com/notes/maths_formulas.pdf', 'Mathematics', 1),
('English Grammar Rules', 'Complete grammar guide', 'PDF', 'https://library.school.com/notes/english_grammar.pdf', 'English', 2),
('Science Experiments Handbook', 'Lab experiment procedures', 'PDF', 'https://library.school.com/notes/science_experiments.pdf', 'Science', 6),
('Hindi Grammar Notes', 'Hindi vyakaran', 'PDF', 'https://library.school.com/notes/hindi_grammar.pdf', 'Hindi', 5),
('Social Studies Timeline', 'History timeline', 'PDF', 'https://library.school.com/notes/social_timeline.pdf', 'Social Studies', 7),
('Computer Science Basics', 'Programming concepts', 'PDF', 'https://library.school.com/notes/cs_basics.pdf', 'Computer Science', 8),
('Physics Formula Sheet', 'Important formulas', 'PDF', 'https://library.school.com/notes/physics_formulas.pdf', 'Physics', 10),
('Chemistry Reactions Guide', 'Common reactions', 'PDF', 'https://library.school.com/notes/chemistry_reactions.pdf', 'Chemistry', 10),
('Biology Diagrams', 'Labeled diagrams', 'PDF', 'https://library.school.com/notes/biology_diagrams.pdf', 'Biology', 9),
('Algebra Practice Problems', '100 problems', 'PDF', 'https://library.school.com/notes/algebra_practice.pdf', 'Mathematics', 7),
('Essay Writing Guide', 'Structure and examples', 'PDF', 'https://library.school.com/notes/essay_writing.pdf', 'English', 6),
('Periodic Table Notes', 'Element properties', 'PDF', 'https://library.school.com/notes/periodic_table.pdf', 'Chemistry', 11),
('Geometry Theorems', 'Proofs and theorems', 'PDF', 'https://library.school.com/notes/geometry_theorems.pdf', 'Mathematics', 9),
('Map Work Guide', 'Geography maps', 'PDF', 'https://library.school.com/notes/map_work.pdf', 'Social Studies', 8),
('Study Tips for Exams', 'Study techniques', 'PDF', 'https://library.school.com/notes/study_tips.pdf', 'General', 1),
('Khan Academy Math', 'Free math tutorials', 'LINK', 'https://www.khanacademy.org/math', 'Mathematics', 1),
('BBC Learning English', 'English lessons', 'LINK', 'https://www.bbc.co.uk/learningenglish', 'English', 1),
('National Geographic Kids', 'Science for young learners', 'LINK', 'https://kids.nationalgeographic.com', 'Science', 1),
('Hindi e-Learning Portal', 'Hindi resources', 'LINK', 'https://hindi.learn.in', 'Hindi', 3),
('History Encyclopedia', 'World history', 'LINK', 'https://www.britannica.com/history', 'Social Studies', 6),
('W3Schools', 'Web development', 'LINK', 'https://www.w3schools.com', 'Computer Science', 8),
('Physics Classroom', 'Physics tutorials', 'LINK', 'https://www.physicsclassroom.com', 'Physics', 9),
('ChemGuide', 'Chemistry tutorials', 'LINK', 'https://www.chemguide.co.uk', 'Chemistry', 10),
('Biology Online', 'Biology articles', 'LINK', 'https://www.biologyonline.com', 'Biology', 9),
('CodingBat', 'Practice coding', 'LINK', 'https://codingbat.com', 'Computer Science', 10),
('GeoGebra', 'Geometry tools', 'LINK', 'https://www.geogebra.org', 'Mathematics', 7),
('Project Gutenberg', 'Free e-books', 'LINK', 'https://www.gutenberg.org', 'English', 11),
('NASA Kids Club', 'Space science', 'LINK', 'https://www.nasa.gov/kidsclub', 'Science', 3),
('OECD Education', 'Education stats', 'LINK', 'https://www.oecd.org/education', 'General', 1),
('Quizlet', 'Study games', 'LINK', 'https://quizlet.com', 'General', 1),
('Wolfram Alpha', 'Computational engine', 'LINK', 'https://www.wolframalpha.com', 'Mathematics', 12),
('Duolingo', 'Language learning', 'LINK', 'https://www.duolingo.com', 'English', 5),
('Virtual Lab', 'Science simulations', 'LINK', 'https://www.vlab.co.in', 'Science', 10),
('EasyBiologyClass', 'Biology notes', 'LINK', 'https://www.easybiologyclass.com', 'Biology', 11),
('TED-Ed', 'Educational videos', 'LINK', 'https://ed.ted.com', 'General', 6)
) t(title, description, rtype, url, cat, cid)
CROSS JOIN (SELECT id FROM users WHERE email = 'superadmin@school.com') sa;
RAISE NOTICE '11. Added digital resources';

-- ============================================================
-- 12. ISSUE BOOKS TO STUDENTS
-- ============================================================
INSERT INTO book_issues (book_id, student_id, issue_date, due_date, status)
SELECT
    b.id,
    s.id,
    CURRENT_DATE - ((RANDOM() * 14)::INT || ' days')::INTERVAL,
    CURRENT_DATE + ((RANDOM() * 30 + 7)::INT || ' days')::INTERVAL,
    'ISSUED'
FROM students s
JOIN student_class sc ON sc.student_id = s.id AND sc.is_active = true
JOIN LATERAL (
    SELECT id FROM library_books
    WHERE category = CASE
        WHEN sc.class_id <= 3 THEN 'Class 1-3'
        WHEN sc.class_id <= 6 THEN 'Class 4-6'
        WHEN sc.class_id <= 9 THEN 'Class 7-9'
        ELSE 'Class 10-12'
    END
    ORDER BY RANDOM() LIMIT 1
) b ON true;

-- Update available counts
UPDATE library_books SET available = GREATEST(available - issues.issued, 0)
FROM (SELECT book_id, COUNT(*) as issued FROM book_issues GROUP BY book_id) issues
WHERE library_books.id = issues.book_id;
RAISE NOTICE '12. Issued books to students';

-- ============================================================
-- 13. TIMETABLE (6 periods/day, Mon-Fri per section)
-- ============================================================
INSERT INTO timetable_entries (class_id, section_id, subject_id, teacher_id, day_of_week, start_time, end_time, room_number)
WITH subjects_per_section AS (
    SELECT c.id AS class_id, sec.id AS section_id, s.id AS subject_id,
           ROW_NUMBER() OVER (PARTITION BY c.id, sec.id ORDER BY s.id) - 1 AS rn,
           COUNT(*) OVER (PARTITION BY c.id, sec.id) AS cnt
    FROM classes c
    JOIN sections sec ON sec.class_id = c.id
    JOIN subjects s ON s.name = ANY(
        CASE WHEN CAST(SUBSTRING(c.name FROM 7) AS INT) <= 5 THEN
            ARRAY['Mathematics','English','Science','Hindi','Physical Education','General']
        WHEN CAST(SUBSTRING(c.name FROM 7) AS INT) <= 10 THEN
            ARRAY['Mathematics','English','Science','Social Studies','Hindi','Computer Science']
        ELSE
            ARRAY['Physics','Chemistry','Biology','Mathematics','English','Physical Education']
        END
    )
)
SELECT
    sps.class_id,
    sps.section_id,
    sps.subject_id,
    COALESCE((SELECT ts.teacher_id FROM teacher_subject ts WHERE ts.subject_id = sps.subject_id ORDER BY RANDOM() LIMIT 1), 1),
    d.dow,
    ('08:00'::TIME + (p.period * 50 || ' minutes')::INTERVAL)::TIME,
    ('08:00'::TIME + ((p.period * 50 + 40) || ' minutes')::INTERVAL)::TIME,
    'Room ' || (100 + (sps.subject_id * 7 + sps.class_id * 3 + sps.section_id * 5 + d.dow) % 200)
FROM subjects_per_section sps
CROSS JOIN (SELECT generate_series(1,5) AS dow) d
CROSS JOIN (SELECT generate_series(0,5) AS period) p
WHERE (p.period + d.dow) % sps.cnt = sps.rn
ON CONFLICT DO NOTHING;
RAISE NOTICE '13. Created timetables';

RAISE NOTICE '=== Demo data seeding complete ===';
END $$;