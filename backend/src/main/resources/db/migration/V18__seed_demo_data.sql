-- Seed comprehensive demo data for development and production testing
-- Password for all imported users: SCHOOL@2024 (bcrypt hash)
-- Requires V16 (demo users) and V17 (test dates) to have run first

DO $$
DECLARE
    bcrypt_hash CONSTANT VARCHAR := '$2a$10$6Dc4D2HHB3c3b73wKTetgegc.Z0U8a67AOzPRWHXzxEml1E.Jsw5W';
    superadmin_id BIGINT;
    first_names VARCHAR[] := ARRAY['Arun','Bhavna','Chirag','Deepa','Ekta','Faisal','Gauri','Hemant','Isha','Jatin','Kavita','Lokesh','Mamta','Naresh','Parul','Radhika','Sachin','Tanvi','Usha','Varun','Yash','Anjali','Brijesh','Chandan','Divya','Gaurav','Hina','Irfan','Jyoti','Karan','Lavanya','Manish','Neha','Pooja','Rahul','Shreya','Tushar','Amit','Babita','Dinesh','Lalit','Mohit','Nidhi','Priya','Rohan','Sneha','Vikas','Arpita','Bhavana','Chetan','Dhruv','Farhan','Girish','Harsh','Kabir','Kirti','Manoj','Nitin','Rekha','Sonal','Vinod','Aarav','Aryan','Dev','Ishita','Krishna','Mira','Ravi','Sana','Tara','Zara','Aisha','Kajal','Ritika','Suresh','Swati'];
    last_names VARCHAR[] := ARRAY['Sharma','Verma','Gupta','Kumar','Singh','Yadav','Joshi','Patel','Das','Mehra','Saxena','Malhotra','Chopra','Reddy','Naidu','Iyer','Menon','Pandey','Dwivedi','Chatterjee','Tiwari','Dubey','Mishra','Bhatt','Rao','Kapoor','Nair','Ahuja','Srinivasan','Deshmukh','Bajaj','Choudhury','Lal','Agarwal','Khanna','Mehta','Sethi','Bose','Sen','Ghosh'];
    student_count INT := 0;
    teacher_count INT := 0;
    total INT;
    first_i INT;
    cid INT;
    cname VARCHAR;
    sec_id INT;
    sec_name VARCHAR;
    sid INT;
    uid INT;
    tid INT;
    subj_id INT;
    subj_name VARCHAR;
    test_id INT;
    hw_id INT;
    hw_title VARCHAR;
    hw_desc VARCHAR;
    today DATE := CURRENT_DATE;
    rnd INT;
    att_date DATE;
    n INT;
    subj_list VARCHAR[];
    teacher_subj_map VARCHAR[];
    ts_val VARCHAR;
    sname VARCHAR;
    slist BIGINT[];
    mm NUMERIC;
    bid INT;
    cat VARCHAR;
BEGIN

-- Check if demo data already exists
SELECT COUNT(*) INTO total FROM students;
IF total > 10 THEN
    RAISE NOTICE 'Demo data already exists (%, skipping)', total;
    RETURN;
END IF;

SELECT id INTO superadmin_id FROM users WHERE email = 'superadmin@school.com';

-- ============================================================
-- 1. CREATE 72 STUDENT USERS + STUDENT RECORDS
-- ============================================================
RAISE NOTICE '1. Creating student users...';

first_i := 1;
FOR cid IN (SELECT id FROM classes ORDER BY id) LOOP
    SELECT name INTO cname FROM classes WHERE id = cid;
    n := CAST(SUBSTRING(cname FROM 7) AS INT);  -- "Class 1" -> 1
    IF n = 10 THEN
        total := 8;
    ELSE
        total := 6;
    END IF;
    FOR sec_name IN (SELECT name FROM sections WHERE class_id = cid ORDER BY name) LOOP
        SELECT id INTO sec_id FROM sections WHERE class_id = cid AND name = sec_name;
        FOR j IN 1..(total/3) LOOP
            sname := first_names[first_i] || ' ' || last_names[(first_i % 40) + 1];
            -- Insert user
            INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
            VALUES (LOWER(REPLACE(sname, ' ', '.')) || first_i || '@school.com', bcrypt_hash,
                    first_names[first_i], last_names[(first_i % 40) + 1], 'STUDENT', true)
            RETURNING id INTO uid;

            -- Generate 6-char student code
            INSERT INTO students (user_id, student_code, date_of_birth, gender)
            VALUES (uid,
                    UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6)),
                    today - (INTERVAL '8 years') - (first_i || ' days')::INTERVAL,
                    CASE WHEN first_i % 2 = 0 THEN 'FEMALE' ELSE 'MALE' END)
            RETURNING id INTO sid;

            INSERT INTO student_class (student_id, class_id, section_id, is_active)
            VALUES (sid, cid, sec_id, true);

            student_count := student_count + 1;
            first_i := first_i + 1;
        END LOOP;
    END LOOP;
END LOOP;
RAISE NOTICE '  % students created', student_count;

-- ============================================================
-- 2. CREATE 20 TEACHER USERS + TEACHER RECORDS
-- ============================================================
RAISE NOTICE '2. Creating teacher users...';

teacher_subj_map := ARRAY[
    'Mohan Verma,Mathematics,Science,Physics',
    'Bhavana Lal,Mathematics',
    'Ramesh Iyer,Mathematics',
    'Brijesh Menon,English',
    'Bhavana Bhatt,English',
    'Reema Chopra,Science',
    'Dinesh Malhotra,Science',
    'Ramesh Kumar,Social Studies',
    'Usha Tiwari,Social Studies',
    'Mamta Singh,Hindi',
    'Brijesh Choudhury,Hindi',
    'Naresh Iyer,Science',
    'Reema Pandey,Science',
    'Dinesh Kapoor,Physics,Computer Science',
    'Poonam Reddy,Physics,Computer Science',
    'Suresh Nair,Chemistry',
    'Shalini Naidu,Chemistry',
    'Girish Kapoor,Biology',
    'Asha Lal,Biology',
    'Dinesh Rao,Science',
    'Amresh Menon,Science'
];
teacher_count := 0;
first_i := first_i + 1;

FOREACH ts_val IN ARRAY teacher_subj_map LOOP
    INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
    VALUES (LOWER(REPLACE(SPLIT_PART(ts_val, ',', 1), ' ', '.')) || '@school.com',
            bcrypt_hash,
            SPLIT_PART(SPLIT_PART(ts_val, ',', 1), ' ', 1),
            SPLIT_PART(SPLIT_PART(ts_val, ',', 1), ' ', 2),
            'TEACHER', true)
    RETURNING id INTO uid;

    INSERT INTO teachers (user_id, teacher_code, qualification, gender)
    VALUES (uid,
            'TCH-' || LPAD((teacher_count + 1)::TEXT, 3, '0'),
            'M.Sc. ' || SPLIT_PART(ts_val, ',', 2),
            CASE WHEN SPLIT_PART(ts_val, ',', 1) LIKE '%a' THEN 'FEMALE' ELSE 'MALE' END)
    RETURNING id INTO tid;

    -- Assign subjects
    FOR j IN 2..ARRAY_LENGTH(STRING_TO_ARRAY(ts_val, ','), 1) LOOP
        SELECT id INTO subj_id FROM subjects WHERE name = SPLIT_PART(ts_val, ',', j);
        IF subj_id IS NOT NULL THEN
            INSERT INTO teacher_subject (teacher_id, subject_id)
            SELECT tid, subj_id
            WHERE NOT EXISTS (SELECT 1 FROM teacher_subject WHERE teacher_id = tid AND subject_id = subj_id);
        END IF;
    END LOOP;
    teacher_count := teacher_count + 1;
END LOOP;
RAISE NOTICE '  % teachers created', teacher_count;

-- ============================================================
-- 3. LINK SUBJECTS TO CLASSES
-- ============================================================
RAISE NOTICE '3. Linking subjects to classes...';
total := 0;
FOR cid IN (SELECT id FROM classes ORDER BY id) LOOP
    SELECT name INTO cname FROM classes WHERE id = cid;
    n := CAST(SUBSTRING(cname FROM 7) AS INT);
    IF n <= 5 THEN
        subj_list := ARRAY['Mathematics','English','Science','Hindi'];
    ELSIF n <= 8 THEN
        subj_list := ARRAY['Mathematics','English','Science','Social Studies','Hindi','Computer Science'];
    ELSIF n <= 10 THEN
        subj_list := ARRAY['Mathematics','English','Science','Social Studies','Hindi','Computer Science','Physical Education'];
    ELSE
        subj_list := ARRAY['Physics','Chemistry','Biology','Mathematics','English'];
    END IF;
    FOREACH subj_name IN ARRAY subj_list LOOP
        SELECT id INTO subj_id FROM subjects WHERE name = subj_name;
        IF subj_id IS NOT NULL THEN
            INSERT INTO class_subject (class_id, subject_id)
            SELECT cid, subj_id
            WHERE NOT EXISTS (SELECT 1 FROM class_subject WHERE class_id = cid AND subject_id = subj_id);
            total := total + 1;
        END IF;
    END LOOP;
END LOOP;
RAISE NOTICE '  % links created', total;

-- ============================================================
-- 4. GENERATE ATTENDANCE (5 days)
-- ============================================================
RAISE NOTICE '4. Generating attendance...';
total := 0;
FOR i IN 1..5 LOOP
    att_date := today - (6 - i) || ' days'::INTERVAL;
    -- Only weekdays
    IF EXTRACT(DOW FROM att_date) BETWEEN 1 AND 5 THEN
        FOR cid IN (SELECT id FROM classes ORDER BY id) LOOP
            SELECT name INTO cname FROM classes WHERE id = cid;
            FOR sec_name IN (SELECT name FROM sections WHERE class_id = cid ORDER BY name) LOOP
                SELECT id INTO sec_id FROM sections WHERE class_id = cid AND name = sec_name;
                FOR sid IN (SELECT s.id FROM students s JOIN student_class sc ON s.id = sc.student_id
                            WHERE sc.class_id = cid AND sc.section_id = sec_id AND sc.is_active = true ORDER BY s.id) LOOP
                    rnd := RANDOM() * 100;
                    IF rnd < 70 THEN
                        INSERT INTO attendance (student_id, class_id, section_id, date, status, marked_by)
                        VALUES (sid, cid, sec_id, att_date, 'PRESENT', superadmin_id)
                        ON CONFLICT DO NOTHING;
                    ELSIF rnd < 80 THEN
                        INSERT INTO attendance (student_id, class_id, section_id, date, status, marked_by)
                        VALUES (sid, cid, sec_id, att_date, 'ABSENT', superadmin_id)
                        ON CONFLICT DO NOTHING;
                    ELSIF rnd < 90 THEN
                        INSERT INTO attendance (student_id, class_id, section_id, date, status, marked_by)
                        VALUES (sid, cid, sec_id, att_date, 'LATE', superadmin_id)
                        ON CONFLICT DO NOTHING;
                    ELSE
                        INSERT INTO attendance (student_id, class_id, section_id, date, status, marked_by)
                        VALUES (sid, cid, sec_id, att_date, 'LEAVE', superadmin_id)
                        ON CONFLICT DO NOTHING;
                    END IF;
                    total := total + 1;
                END LOOP;
            END LOOP;
        END LOOP;
    END IF;
END LOOP;
RAISE NOTICE '  % attendance records', total;

-- ============================================================
-- 5. CREATE TESTS (2-4 per class/section with mixed dates)
-- ============================================================
RAISE NOTICE '5. Creating tests...';
total := 0;
FOR cid IN (SELECT id FROM classes ORDER BY id) LOOP
    SELECT name INTO cname FROM classes WHERE id = cid;
    n := CAST(SUBSTRING(cname FROM 7) AS INT);
    IF n <= 5 THEN subj_list := ARRAY['Mathematics','English'];
    ELSIF n <= 8 THEN subj_list := ARRAY['Mathematics','Science','English'];
    ELSIF n <= 10 THEN subj_list := ARRAY['Mathematics','Science','English','Social Studies'];
    ELSE subj_list := ARRAY['Physics','Chemistry','Biology','Mathematics'];
    END IF;
    FOR sec_name IN (SELECT name FROM sections WHERE class_id = cid ORDER BY name) LOOP
        SELECT id INTO sec_id FROM sections WHERE class_id = cid AND name = sec_name;
        FOREACH subj_name IN ARRAY subj_list LOOP
            SELECT id INTO subj_id FROM subjects WHERE name = subj_name;
            IF subj_id IS NULL THEN CONTINUE; END IF;
            SELECT ts.teacher_id INTO tid FROM teacher_subject ts WHERE ts.subject_id = subj_id LIMIT 1;
            IF tid IS NULL THEN CONTINUE; END IF;
            -- Mix past and future dates
            IF RANDOM() < 0.4 THEN
                att_date := today - ((RANDOM() * 10 + 1)::INT || ' days')::INTERVAL;
            ELSE
                att_date := today + ((RANDOM() * 14 + 1)::INT || ' days')::INTERVAL;
            END IF;
            mm := 100;
            INSERT INTO tests (title, subject_id, class_id, section_id, teacher_id, maximum_marks, passing_marks, test_date, exam_type, is_published)
            VALUES ('Class Test - ' || subj_name, subj_id, cid, sec_id, tid, mm, mm * 0.35, att_date, 'QUIZ', true);
            total := total + 1;
        END LOOP;
    END LOOP;
END LOOP;
RAISE NOTICE '  % tests created', total;

-- ============================================================
-- 6. ENTER MARKS FOR PAST TESTS
-- ============================================================
RAISE NOTICE '6. Entering marks...';
total := 0;
FOR test_id IN (SELECT id FROM tests WHERE test_date < today ORDER BY id) LOOP
    SELECT t.maximum_marks, t.class_id, t.section_id INTO mm, cid, sec_id FROM tests t WHERE t.id = test_id;
    FOR sid IN (SELECT s.id FROM students s JOIN student_class sc ON s.id = sc.student_id
                WHERE sc.class_id = cid AND sc.section_id = sec_id AND sc.is_active = true ORDER BY s.id) LOOP
        INSERT INTO marks (test_id, student_id, marks_obtained, entered_by)
        VALUES (test_id, sid, (RANDOM() * (mm * 0.75) + mm * 0.25)::INT, superadmin_id)
        ON CONFLICT (test_id, student_id) DO UPDATE SET marks_obtained = EXCLUDED.marks_obtained;
        total := total + 1;
    END LOOP;
END LOOP;
RAISE NOTICE '  % marks entered', total;

-- ============================================================
-- 7. CREATE EXAM SCHEDULES
-- ============================================================
RAISE NOTICE '7. Creating exam schedules...';
total := 0;
FOR cid IN (SELECT id FROM classes ORDER BY id) LOOP
    SELECT name INTO cname FROM classes WHERE id = cid;
    n := CAST(SUBSTRING(cname FROM 7) AS INT);
    IF n <= 5 THEN subj_list := ARRAY['Mathematics','English','Science','Hindi'];
    ELSIF n <= 10 THEN subj_list := ARRAY['Mathematics','English','Science','Social Studies','Hindi','Computer Science'];
    ELSE subj_list := ARRAY['Physics','Chemistry','Biology','Mathematics','English'];
    END IF;
    FOREACH subj_name IN ARRAY subj_list LOOP
        SELECT id INTO subj_id FROM subjects WHERE name = subj_name;
        IF subj_id IS NULL THEN CONTINUE; END IF;
        INSERT INTO exam_schedules (title, class_id, subject_id, exam_type, date, start_time, end_time, room_number)
        VALUES ('Mid-Term Examination', cid, subj_id, 'MIDTERM', today + INTERVAL '75 days',
                '09:00:00', '12:00:00', 'Room ' || (100 + (RANDOM() * 200)::INT));
        total := total + 1;
        INSERT INTO exam_schedules (title, class_id, subject_id, exam_type, date, start_time, end_time, room_number)
        VALUES ('Final Examination', cid, subj_id, 'FINAL', today + INTERVAL '160 days',
                '09:00:00', '12:00:00', 'Room ' || (100 + (RANDOM() * 200)::INT));
        total := total + 1;
    END LOOP;
END LOOP;
RAISE NOTICE '  % exam schedules created', total;

-- ============================================================
-- 8. CREATE HOMEWORK (2 per class)
-- ============================================================
RAISE NOTICE '8. Creating homework assignments...';
total := 0;
FOR cid IN (SELECT id FROM classes ORDER BY id) LOOP
    SELECT name INTO cname FROM classes WHERE id = cid;
    FOREACH subj_name IN ARRAY ARRAY['Mathematics', 'English'] LOOP
        SELECT id INTO subj_id FROM subjects WHERE name = subj_name;
        IF subj_id IS NULL THEN CONTINUE; END IF;
        SELECT ts.teacher_id INTO tid FROM teacher_subject ts WHERE ts.subject_id = subj_id LIMIT 1;
        IF tid IS NULL THEN CONTINUE; END IF;
        hw_title := subj_name || ' Homework - ' || cname;
        hw_desc := 'Complete the ' || subj_name || ' assignment for ' || cname || '. Submit by due date.';
        INSERT INTO homework (title, description, subject_id, teacher_id, due_date, max_score)
        VALUES (hw_title, hw_desc, subj_id, tid, today + INTERVAL '7 days', 50)
        RETURNING id INTO hw_id;
        FOR sec_id IN (SELECT id FROM sections WHERE class_id = cid ORDER BY id) LOOP
            INSERT INTO homework_target (homework_id, class_id, section_id)
            VALUES (hw_id, cid, sec_id);
        END LOOP;
        total := total + 1;
    END LOOP;
END LOOP;
RAISE NOTICE '  % homework assignments created', total;

-- ============================================================
-- 9. CREATE STUDENT GOALS
-- ============================================================
RAISE NOTICE '9. Creating student goals...';
total := 0;
FOR sid IN (SELECT id FROM students ORDER BY id) LOOP
    SELECT user_id INTO uid FROM students WHERE id = sid;
    INSERT INTO student_goals (student_id, user_id, title, description, target_date, target_score, current_progress, category, unit)
    VALUES (sid, uid,
            CASE (RANDOM() * 2)::INT
                WHEN 0 THEN 'Improve Math score'
                WHEN 1 THEN 'Perfect attendance this month'
                ELSE 'Complete all homework on time'
            END,
            'Personal academic goal',
            today + ((RANDOM() * 60 + 30)::INT || ' days')::INTERVAL,
            (RANDOM() * 20 + 80)::INT,
            (RANDOM() * 50 + 30)::INT,
            CASE (RANDOM() * 2)::INT
                WHEN 0 THEN 'Academic'
                WHEN 1 THEN 'Attendance'
                ELSE 'Behavior'
            END,
            'Percentage');
    total := total + 1;
END LOOP;
RAISE NOTICE '  % goals created', total;

-- ============================================================
-- 10. ADD LIBRARY BOOKS
-- ============================================================
RAISE NOTICE '10. Adding library books...';
total := 0;
INSERT INTO library_books (title, author, isbn, publisher, category, quantity, available, shelf_location)
VALUES ('ABC of English', 'R.K. Gupta', '9780143101001', 'Penguin', 'Class 1-3', 5, 5, 'A1');
total := total + 1;
INSERT INTO library_books (title, author, isbn, publisher, category, quantity, available, shelf_location)
VALUES ('Math Magic', 'S. Sharma', '9780143101002', 'NCERT', 'Class 1-3', 5, 5, 'A2');
total := total + 1;
INSERT INTO library_books (title, author, isbn, publisher, category, quantity, available, shelf_location)
VALUES ('Science Around Us', 'P. Verma', '9780143101003', 'Oxford', 'Class 1-3', 5, 5, 'B1');
total := total + 1;
INSERT INTO library_books (title, author, isbn, publisher, category, quantity, available, shelf_location)
VALUES ('Hindi Varnmala', 'A. Singh', '9780143101004', 'Hindi Pustak', 'Class 1-3', 5, 5, 'B2');
total := total + 1;
INSERT INTO library_books (title, author, isbn, publisher, category, quantity, available, shelf_location)
VALUES ('Fun with Numbers', 'M. Joshi', '9780143101005', 'Cambridge', 'Class 1-3', 5, 5, 'C1');
total := total + 1;
INSERT INTO library_books (title, author, isbn, publisher, category, quantity, available, shelf_location)
VALUES ('English Grammar & Composition', 'Wren & Martin', '9780143101006', 'S. Chand', 'Class 4-6', 5, 5, 'C2');
total := total + 1;
INSERT INTO library_books (title, author, isbn, publisher, category, quantity, available, shelf_location)
VALUES ('General Science', 'Lakhmir Singh', '9780143101007', 'S. Chand', 'Class 4-6', 5, 5, 'D1');
total := total + 1;
INSERT INTO library_books (title, author, isbn, publisher, category, quantity, available, shelf_location)
VALUES ('Social Studies Basics', 'R. Jain', '9780143101008', 'Ratna Sagar', 'Class 4-6', 5, 5, 'D2');
total := total + 1;
INSERT INTO library_books (title, author, isbn, publisher, category, quantity, available, shelf_location)
VALUES ('Mathematics for Middle School', 'R.S. Aggarwal', '9780143101009', 'Arya', 'Class 4-6', 5, 5, 'E1');
total := total + 1;
INSERT INTO library_books (title, author, isbn, publisher, category, quantity, available, shelf_location)
VALUES ('Computer Fundamentals', 'V. Rajaraman', '9780143101010', 'PHI', 'Class 4-6', 5, 5, 'E2');
total := total + 1;
INSERT INTO library_books (title, author, isbn, publisher, category, quantity, available, shelf_location)
VALUES ('Physics Foundation', 'H.C. Verma', '9780143101011', 'Bharati', 'Class 7-9', 5, 5, 'F1');
total := total + 1;
INSERT INTO library_books (title, author, isbn, publisher, category, quantity, available, shelf_location)
VALUES ('Chemistry Basics', 'O.P. Tandon', '9780143101012', 'S. Chand', 'Class 7-9', 5, 5, 'F2');
total := total + 1;
INSERT INTO library_books (title, author, isbn, publisher, category, quantity, available, shelf_location)
VALUES ('Biology Essentials', 'Trueman', '9780143101013', 'Arihant', 'Class 7-9', 5, 5, 'G1');
total := total + 1;
INSERT INTO library_books (title, author, isbn, publisher, category, quantity, available, shelf_location)
VALUES ('Advanced Mathematics', 'R.D. Sharma', '9780143101014', 'Dhanpat Rai', 'Class 7-9', 5, 5, 'G2');
total := total + 1;
INSERT INTO library_books (title, author, isbn, publisher, category, quantity, available, shelf_location)
VALUES ('English Literature Reader', 'Various', '9780143101015', 'Oxford', 'Class 7-9', 5, 5, 'H1');
total := total + 1;
INSERT INTO library_books (title, author, isbn, publisher, category, quantity, available, shelf_location)
VALUES ('Science for Class 10', 'NCERT', '9780143101016', 'NCERT', 'Class 10-12', 5, 5, 'H2');
total := total + 1;
INSERT INTO library_books (title, author, isbn, publisher, category, quantity, available, shelf_location)
VALUES ('Mathematics for Class 11', 'R.S. Aggarwal', '9780143101017', 'Arya', 'Class 10-12', 5, 5, 'I1');
total := total + 1;
INSERT INTO library_books (title, author, isbn, publisher, category, quantity, available, shelf_location)
VALUES ('Physics Part I & II', 'Resnick Halliday', '9780143101018', 'Wiley', 'Class 10-12', 5, 5, 'I2');
total := total + 1;
INSERT INTO library_books (title, author, isbn, publisher, category, quantity, available, shelf_location)
VALUES ('Organic Chemistry', 'Morrison & Boyd', '9780143101019', 'Pearson', 'Class 10-12', 5, 5, 'J1');
total := total + 1;
INSERT INTO library_books (title, author, isbn, publisher, category, quantity, available, shelf_location)
VALUES ('Reference Encyclopedia', 'Britannica', '9780143101020', 'Encyclopedia', 'Reference', 3, 3, 'J2');
total := total + 1;
RAISE NOTICE '  % books added', total;

-- ============================================================
-- 11. ADD PDF NOTES & ONLINE LINKS
-- ============================================================
RAISE NOTICE '11. Adding digital resources...';
total := 0;

INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('Mathematics Formulas Sheet', 'Formula reference for quick revision', 'PDF', 'https://library.school.com/notes/maths_formulas.pdf', 'Mathematics', 1, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('English Grammar Rules', 'Complete grammar guide with examples', 'PDF', 'https://library.school.com/notes/english_grammar.pdf', 'English', 2, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('Science Experiments Handbook', 'Lab experiment procedures', 'PDF', 'https://library.school.com/notes/science_experiments.pdf', 'Science', 6, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('Hindi Grammar Notes', 'Hindi vyakaran for competitive exams', 'PDF', 'https://library.school.com/notes/hindi_grammar.pdf', 'Hindi', 5, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('Social Studies Timeline', 'History timeline ancient to modern', 'PDF', 'https://library.school.com/notes/social_timeline.pdf', 'Social Studies', 7, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('Computer Science Basics', 'Introduction to programming concepts', 'PDF', 'https://library.school.com/notes/cs_basics.pdf', 'Computer Science', 8, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('Physics Formula Sheet', 'Important formulas with derivations', 'PDF', 'https://library.school.com/notes/physics_formulas.pdf', 'Physics', 10, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('Chemistry Reactions Guide', 'Common chemical reactions', 'PDF', 'https://library.school.com/notes/chemistry_reactions.pdf', 'Chemistry', 10, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('Biology Diagrams', 'Labeled diagrams for human anatomy', 'PDF', 'https://library.school.com/notes/biology_diagrams.pdf', 'Biology', 9, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('Algebra Practice Problems', '100 algebra problems with solutions', 'PDF', 'https://library.school.com/notes/algebra_practice.pdf', 'Mathematics', 7, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('Essay Writing Guide', 'Structure and examples', 'PDF', 'https://library.school.com/notes/essay_writing.pdf', 'English', 6, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('Periodic Table Notes', 'Element properties and trends', 'PDF', 'https://library.school.com/notes/periodic_table.pdf', 'Chemistry', 11, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('Geometry Theorems', 'Proofs and theorems for geometry', 'PDF', 'https://library.school.com/notes/geometry_theorems.pdf', 'Mathematics', 9, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('Map Work Guide', 'Geography maps and locations', 'PDF', 'https://library.school.com/notes/map_work.pdf', 'Social Studies', 8, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('Study Tips for Exams', 'Effective study techniques', 'PDF', 'https://library.school.com/notes/study_tips.pdf', 'General', 1, superadmin_id); total := total + 1;

INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('Khan Academy Math', 'Free math tutorials basic to advanced', 'LINK', 'https://www.khanacademy.org/math', 'Mathematics', 1, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('BBC Learning English', 'English lessons with audio and video', 'LINK', 'https://www.bbc.co.uk/learningenglish', 'English', 1, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('National Geographic Kids', 'Science and nature for young learners', 'LINK', 'https://kids.nationalgeographic.com', 'Science', 1, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('Hindi e-Learning Portal', 'Hindi language learning resources', 'LINK', 'https://hindi.learn.in', 'Hindi', 3, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('History Encyclopedia', 'World history articles and timelines', 'LINK', 'https://www.britannica.com/history', 'Social Studies', 6, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('W3Schools', 'Learn web development interactively', 'LINK', 'https://www.w3schools.com', 'Computer Science', 8, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('Physics Classroom', 'Interactive physics tutorials', 'LINK', 'https://www.physicsclassroom.com', 'Physics', 9, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('ChemGuide', 'Chemistry tutorials for high school', 'LINK', 'https://www.chemguide.co.uk', 'Chemistry', 10, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('Biology Online', 'Biology articles and quizzes', 'LINK', 'https://www.biologyonline.com', 'Biology', 9, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('CodingBat', 'Practice Java and Python coding', 'LINK', 'https://codingbat.com', 'Computer Science', 10, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('GeoGebra', 'Interactive geometry and algebra tools', 'LINK', 'https://www.geogebra.org', 'Mathematics', 7, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('Project Gutenberg', 'Free e-books for literature', 'LINK', 'https://www.gutenberg.org', 'English', 11, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('NASA Kids Club', 'Space science and activities', 'LINK', 'https://www.nasa.gov/kidsclub', 'Science', 3, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('OECD Education', 'Educational statistics and reports', 'LINK', 'https://www.oecd.org/education', 'General', 1, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('Quizlet', 'Flashcards and study games', 'LINK', 'https://quizlet.com', 'General', 1, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('Wolfram Alpha', 'Computational knowledge engine', 'LINK', 'https://www.wolframalpha.com', 'Mathematics', 12, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('Duolingo', 'Free language learning platform', 'LINK', 'https://www.duolingo.com', 'English', 5, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('Virtual Lab', 'Online science lab simulations', 'LINK', 'https://www.vlab.co.in', 'Science', 10, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('EasyBiologyClass', 'Biology notes and diagrams', 'LINK', 'https://www.easybiologyclass.com', 'Biology', 11, superadmin_id); total := total + 1;
INSERT INTO library_resources (title, description, resource_type, url, category, class_id, uploaded_by_id)
VALUES ('TED-Ed', 'Educational videos and lessons', 'LINK', 'https://ed.ted.com', 'General', 6, superadmin_id); total := total + 1;
RAISE NOTICE '  % resources added', total;

-- ============================================================
-- 12. ISSUE BOOKS TO STUDENTS
-- ============================================================
RAISE NOTICE '12. Issuing books to students...';
total := 0;
FOR sid IN (SELECT id FROM students ORDER BY id) LOOP
    SELECT sc.class_id INTO cid FROM student_class sc WHERE sc.student_id = sid AND sc.is_active = true;
    IF cid IS NULL THEN CONTINUE; END IF;
    IF cid <= 3 THEN cat := 'Class 1-3';
    ELSIF cid <= 6 THEN cat := 'Class 4-6';
    ELSIF cid <= 9 THEN cat := 'Class 7-9';
    ELSE cat := 'Class 10-12';
    END IF;
    SELECT id INTO bid FROM library_books WHERE category = cat ORDER BY RANDOM() LIMIT 1;
    IF bid IS NULL THEN CONTINUE; END IF;
    INSERT INTO book_issues (book_id, student_id, issue_date, due_date, status)
    VALUES (bid, sid, today - ((RANDOM() * 14)::INT || ' days')::INTERVAL,
            today + ((RANDOM() * 30 + 7)::INT || ' days')::INTERVAL, 'ISSUED');
    UPDATE library_books SET available = available - 1 WHERE id = bid AND available > 0;
    total := total + 1;
END LOOP;
RAISE NOTICE '  % books issued', total;

RAISE NOTICE '=== Demo data seeding complete ===';
END $$;