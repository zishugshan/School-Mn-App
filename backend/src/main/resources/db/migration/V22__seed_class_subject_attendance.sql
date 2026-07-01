-- Link subjects to classes + generate 5 days of attendance
DO $$
BEGIN
    IF (SELECT COUNT(*) > 0 FROM class_subject) THEN
        RAISE NOTICE 'Class-subject links exist, skipping V22';
        RETURN;
    END IF;

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

    INSERT INTO attendance (student_id, class_id, section_id, date, status, marked_by)
    SELECT s.id, sc.class_id, sc.section_id, d.d,
           (ARRAY['PRESENT','PRESENT','PRESENT','PRESENT','PRESENT','PRESENT','PRESENT','ABSENT','LATE','LEAVE'])[LEAST((RANDOM() * 10)::INT, 9) + 1],
           (SELECT id FROM users WHERE email = 'superadmin@school.com')
    FROM students s
    JOIN student_class sc ON sc.student_id = s.id AND sc.is_active = true
    CROSS JOIN (SELECT (CURRENT_DATE - 6 + g) AS d FROM generate_series(0,4) g) d
    WHERE EXTRACT(DOW FROM d.d) BETWEEN 1 AND 5
    ON CONFLICT DO NOTHING;
END $$;
