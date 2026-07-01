-- Create tests (2-4 per class/section) and enter marks
DO $$
BEGIN
    IF (SELECT COUNT(*) > 10 FROM tests) THEN
        RAISE NOTICE 'Tests exist, skipping V23';
        RETURN;
    END IF;

    INSERT INTO tests (title, subject_id, class_id, section_id, teacher_id, maximum_marks, passing_marks, test_date, exam_type, is_published)
    SELECT
        'Class Test - ' || s.name, s.id, c.id, sec.id,
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

    INSERT INTO marks (test_id, student_id, marks_obtained, entered_by)
    SELECT t.id, s.id, (RANDOM() * 75 + 25)::INT, (SELECT id FROM users WHERE email = 'superadmin@school.com')
    FROM tests t
    JOIN student_class sc ON sc.class_id = t.class_id AND sc.section_id = t.section_id AND sc.is_active = true
    JOIN students s ON s.id = sc.student_id
    WHERE t.test_date < CURRENT_DATE
    ON CONFLICT (test_id, student_id) DO UPDATE SET marks_obtained = EXCLUDED.marks_obtained;
END $$;
