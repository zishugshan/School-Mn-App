-- Create student goals and library resources
DO $$
BEGIN
    IF (SELECT COUNT(*) > 10 FROM student_goals) THEN
        RAISE NOTICE 'Goals exist, skipping V25';
        RETURN;
    END IF;

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

    INSERT INTO book_issues (book_id, student_id, issue_date, due_date, status)
    SELECT b.id, s.id,
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

    UPDATE library_books SET available = GREATEST(available - issues.issued, 0)
    FROM (SELECT book_id, COUNT(*) as issued FROM book_issues GROUP BY book_id) issues
    WHERE library_books.id = issues.book_id;
END $$;
